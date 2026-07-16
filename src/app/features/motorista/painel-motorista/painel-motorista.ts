import { Component, inject, OnInit, OnDestroy, Injector, runInInjectionContext, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc, collection, query, where, onSnapshot, getDocs, deleteDoc } from '@angular/fire/firestore';

import * as L from 'leaflet';

export interface Motorista {
  id?: string;
  nomeCompleto: string;
  cidade: string;
  telefone: string;
  email: string;
  fotoPerfilBase64: string;
  avaliacao: number;
  valorPorKm: number;
  marcaCarro: string;
  modeloCarro: string;
  placaCarro: string;
  corCarro: string;
}

export interface Agendamento {
  id?: string;
  idMotorista: string;
  idPassageiro: string;
  nomePassageiro: string;
  telefonePassageiro: string;
  localPartida: string;
  localDestino: string;
  distanciaKm: number;
  valorTotal: number;
  dataCorrida: string;
  horarioCorrida: string;
  status: string;
  horarioSolicitacao: string;
}

@Component({
  selector: 'app-painel-motorista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-motorista.html',
  styleUrl: './painel-motorista.css'
})
export class PainelMotorista implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  motoristaAtual: Motorista | null = null;
  nomeMotorista: string = 'Carregando...';
  fotoMotorista: string = '';
  abaAtiva: 'dashboard' | 'ganhos' | 'avaliacoes' = 'dashboard';

  ganhosTotais: number = 0;
  totalCorridas: number = 0;
  historicoCorridas: any[] = [];
  listaComentarios: any[] = [];

  menuLateralAberto: boolean = false;
  mostrarConfirmacaoAcao: boolean = false;
  tituloPopUpAcao: string = '';
  descricaoPopUpAcao: string = '';

  corridaPendente: Agendamento | null = null;
  private agendamentosSubscription: any = null;

  private map!: L.Map;
  private markersGroup!: L.LayerGroup;

  ngOnInit(): void {
    runInInjectionContext(this.injector, () => {
      this.zone.run(() => {
        this.verificarUsuarioLogado();
      });
    });
  }

  ngOnDestroy(): void {
    this.destruirMapa();
    if (this.agendamentosSubscription) this.agendamentosSubscription();
  }

  private verificarUsuarioLogado(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(this.firestore, 'motoristas', user.uid));
          if (snap.exists()) {
            this.zone.run(() => {
              this.motoristaAtual = snap.data() as Motorista;
              this.motoristaAtual.id = user.uid;
              this.nomeMotorista = this.motoristaAtual.nomeCompleto || 'Motorista Parceiro';
              this.fotoMotorista = this.motoristaAtual.fotoPerfilBase64 || '';

              this.escutarAgendamentosFocalizados(user.uid);
              this.carregarHistoricoDeGanhos(user.uid);
              this.carregarComentariosRecebidos(user.uid);
              this.cdr.detectChanges();
            });
          }
        } catch {}
      } else {
        this.zone.run(() => this.router.navigate(['/login']));
      }
    });
  }

  private escutarAgendamentosFocalizados(motoristaId: string): void {
    const q = query(collection(this.firestore, 'agendamentos'), where('idMotorista', '==', motoristaId), where('status', 'in', ['Pendente', 'Aceito']));
    this.agendamentosSubscription = onSnapshot(q, (snapshot) => {
      this.zone.run(() => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          this.corridaPendente = docSnap.data() as Agendamento;
          this.corridaPendente.id = docSnap.id;
          this.cdr.detectChanges();
          setTimeout(() => this.inicializarMapaCorrida(), 300);
        } else {
          this.destruirMapa();
          this.corridaPendente = null;
          this.cdr.detectChanges();
        }
      });
    });
  }

  private async carregarHistoricoDeGanhos(motoristaId: string): Promise<void> {
    const snapshot = await getDocs(query(collection(this.firestore, 'agendamentos_finalizados'), where('idMotorista', '==', motoristaId)));
    let soma = 0; const lista: any[] = [];
    snapshot.forEach(d => { soma += d.data()['valorTotal'] || 0; lista.push({ id: d.id, ...d.data() }); });
    this.zone.run(() => { this.historicoCorridas = lista; this.ganhosTotais = soma; this.totalCorridas = lista.length; this.cdr.detectChanges(); });
  }

  private async carregarComentariosRecebidos(motoristaId: string): Promise<void> {
    const snapshot = await getDocs(query(collection(this.firestore, 'feedbacks'), where('idMotorista', '==', motoristaId)));
    const lista: any[] = []; snapshot.forEach(d => lista.push({ id: d.id, ...d.data() }));
    this.zone.run(() => { this.listaComentarios = lista; this.cdr.detectChanges(); });
  }

  async excluirComentario(id: string): Promise<void> {
    if (confirm('Remover comentário?')) {
      await deleteDoc(doc(this.firestore, 'feedbacks', id));
      this.listaComentarios = this.listaComentarios.filter(f => f.id !== id);
      this.cdr.detectChanges();
    }
  }

  async aceitarAgendamento(): Promise<void> { await updateDoc(doc(this.firestore, 'agendamentos', this.corridaPendente!.id!), { status: 'Aceito' }); }
  async recusarAgendamento(): Promise<void> { await updateDoc(doc(this.firestore, 'agendamentos', this.corridaPendente!.id!), { status: 'Recusado' }); }

  async finalizarCorrida(): Promise<void> {
    await updateDoc(doc(this.firestore, 'agendamentos', this.corridaPendente!.id!), { status: 'Finalizado' });
    this.zone.run(() => {
      this.tituloPopUpAcao = 'Corrida Finalizada!';
      this.descricaoPopUpAcao = 'Aguarde o passageiro realizar a avaliação da corrida.';
      this.mostrarConfirmacaoAcao = true;
      this.carregarHistoricoDeGanhos(this.motoristaAtual!.id!);
    });
  }

  private async inicializarMapaCorrida(): Promise<void> {
    const el = document.getElementById('map-motorista'); if (!el || !this.corridaPendente) return;
    if (this.map) this.destruirMapa();
    this.map = L.map('map-motorista', { zoomControl: false }).setView([-12.9714, -38.5014], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.markersGroup = L.layerGroup().addTo(this.map);
    const p = await this.buscarCoordenadas(this.corridaPendente.localPartida);
    const d = await this.buscarCoordenadas(this.corridaPendente.localDestino);
    if (p && d) {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${p.lon},${p.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes.length > 0) {
        const cam = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        L.marker([p.lat, p.lon]).addTo(this.markersGroup);
        L.marker([d.lat, d.lon]).addTo(this.markersGroup);
        L.polyline(cam, { color: '#00e0ff', weight: 5 }).addTo(this.markersGroup);
        this.map.fitBounds(L.latLngBounds(cam), { padding: [30, 30] });
      }
    }
  }

  private async buscarCoordenadas(endereco: string): Promise<{lat: number, lon: number} | null> {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco)}`);
      const data = await res.json();
      return data.length > 0 ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) } : null;
    } catch { return null; }
  }

  private destruirMapa(): void { if (this.map) { this.map.off(); this.map.remove(); } }
  fecharPopUpAcao(): void { this.mostrarConfirmacaoAcao = false; }
  alternarMenu(): void { this.menuLateralAberto = !this.menuLateralAberto; }
  formatarData(d: string): string { if (!d) return ''; const p = d.split('-'); return `${p[2]}/${p[1]}/${p[0]}`; }
  async deslogar(): Promise<void> { if (confirm('Sair?')) { await this.auth.signOut(); this.zone.run(() => this.router.navigate(['/login'])); } }
}
