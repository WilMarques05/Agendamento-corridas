import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  Injector,
  runInInjectionContext,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from '@angular/fire/firestore';

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
  fotoCarroExternaBase64: string;
  fotoCarroInternaBase64: string;
}

export interface Passageiro {
  id?: string;
  nomeCompleto: string;
  telefone: string;
  cpf: string;
  email: string;
  fotoPerfilBase64: string;
  avaliacao: number;
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

// ✅ Interface para renderizar o Histórico Completo em "Minhas Corridas"
export interface CorridaFinalizada {
  id?: string;
  idPassageiro: string;
  nomeMotorista: string;
  localPartida: string;
  localDestino: string;
  valorTotal: number;
  dataCorrida: string;
  horarioCorrida: string;
  notaMotorista: number;
  notaVeiculo: number;
  comentario: string;
  horarioConclusao: string;
}

@Component({
  selector: 'app-painel-passageiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-passageiro.html',
  styleUrl: './painel-passageiro.css',
})

export class PainelPassageiro implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);
  passageiroAtual: Passageiro | null = null;
  nomePassageiro: string = 'Carregando...';
  fotoPassageiro: string = '';

  menuLateralAberto: boolean = false;
  calculandoRota: boolean = false;
  rotaCalculada: boolean = false;
  tentouSubmeter: boolean = false;

  // Controle de Abas original do dashboard
  abaAtiva: 'solicitar' | 'historico' = 'solicitar';

  mostrarConfirmacaoPopUp: boolean = false;
  mostrarAlertaAgendamentoAtivo: boolean = false;
  mostrarPopUpCancelamento: boolean = false;
  mostrarPopUpCanceladoSucesso: boolean = false;
  mostrarModalAvaliacao: boolean = false;

  notaMotoristaTemp: number = 5;
  notaVeiculoTemp: number = 5;
  comentarioTemp: string = '';

  idMotoristaDoAgendamento: string = '';
  agendamentoBackup: Agendamento | null = null;

  dataMinima: string = '';
  sugestoesOrigem: string[] = [];
  sugestoesDestino: string[] = [];
  private debounceTimer: any;

  private map!: L.Map;
  private markersGroup!: L.LayerGroup;
  private mapEspera!: L.Map;
  private markersGroupEspera!: L.LayerGroup;

  motoristas: Motorista[] = [];
  minhasCorridas: CorridaFinalizada[] = []; // ✅ Lista carregada do histórico
  motoristaSelecionado: Motorista | null = null;
  agendamentoAtivo: Agendamento | null = null;
  motoristaDoAgendamento: Motorista | null = null;

  private agendamentoSubscription: any = null;
  private motoristasSubscription: any = null;
  private historicoSubscription: any = null;

  dadosCorrida = {
    data: '',
    hora: '',
    origem: '',
    destino: '',
    distancia: 0,
    tempo: '',
    valorTotal: 0,
  };

  ngOnInit(): void {
    this.calcularDataMinima();
    // Adicione isto dentro do ngOnInit(), antes de chamar o runInInjectionContext
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;
    runInInjectionContext(this.injector, () => {
      this.zone.run(() => {
        this.obterDadosPassageiro();
        this.escutarMotoristasTempoReal();
      });
    });
  }

  ngOnDestroy(): void {
    this.destruirMapa();
    this.destruirMapaEspera();
    if (this.agendamentoSubscription) this.agendamentoSubscription();
    if (this.motoristasSubscription) this.motoristasSubscription();
    if (this.historicoSubscription) this.historicoSubscription();
  }

  private calcularDataMinima(): void {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    this.dataMinima = `${ano}-${mes}-${dia}`;
  }

  private obterDadosPassageiro(): void {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const passageiroRef = doc(this.firestore, 'passageiros', user.uid);
          const snap = await getDoc(passageiroRef);
          if (snap.exists()) {
            this.zone.run(() => {
              this.passageiroAtual = snap.data() as Passageiro;
              this.passageiroAtual.id = user.uid;
              this.nomePassageiro = this.passageiroAtual.nomeCompleto || 'Passageiro VIP';
              this.fotoPassageiro = this.passageiroAtual.fotoPerfilBase64 || '';
              this.escutarAgendamentosAtivos(user.uid);
              this.escutarHistoricoCorridas(user.uid); // ✅ Ativa escuta do histórico
              this.cdr.detectChanges();
            });
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        this.zone.run(() => this.router.navigate(['/login']));
      }
    });
  }

  private escutarMotoristasTempoReal(): void {
    const colecaoRef = collection(this.firestore, 'motoristas');
    this.motoristasSubscription = onSnapshot(colecaoRef, (snapshot) => {
      const lista: Motorista[] = [];
      snapshot.forEach((docSnap) => {
        const dados = docSnap.data() as any;
        const filtrarBlob = (url: string | undefined): string =>
          !url || url.startsWith('blob:') ? '' : url;
        lista.push({
          id: docSnap.id,
          nomeCompleto: dados.nomeCompleto || 'Motorista',
          cidade: dados.cidade || 'Salvador',
          telefone: dados.telefone || '',
          email: dados.email || '',
          avaliacao: dados.avaliacao != null ? dados.avaliacao : 5.0,
          valorPorKm: dados.valorPorKm || 3.5,
          modeloCarro: dados.modeloCarro || 'Veículo',
          marcaCarro: dados.marcaCarro || '',
          placaCarro: dados.placaCarro || '',
          corCarro: dados.corCarro || '',
          fotoPerfilBase64: filtrarBlob(dados.fotoPerfilBase64 || dados.fotoPerfil),
          fotoCarroInternaBase64: filtrarBlob(
            dados.fotoCarroInternaBase64 || dados.fotoCarroInterna,
          ),
          fotoCarroExternaBase64: filtrarBlob(
            dados.fotoCarroExternaBase64 || dados.fotoCarroExterna,
          ),
        });
      });
      this.zone.run(() => {
        this.motoristas = lista;
        if (this.motoristaSelecionado) {
          const atualizado = lista.find((m) => m.id === this.motoristaSelecionado?.id);
          if (atualizado) this.motoristaSelecionado = atualizado;
        }
        this.cdr.detectChanges();
      });
    });
  }

  // ✅ ESCUTAR HISTÓRICO DE CORRIDAS DO USUÁRIO EM TEMPO REAL
  private escutarHistoricoCorridas(passageiroId: string): void {
    const q = query(
      collection(this.firestore, 'agendamentos_finalizados'),
      where('idPassageiro', '==', passageiroId),
      orderBy('horarioConclusao', 'desc'),
    );

    this.historicoSubscription = onSnapshot(q, (snapshot) => {
      const lista: CorridaFinalizada[] = [];
      snapshot.forEach((dSnap) => {
        lista.push({ id: dSnap.id, ...dSnap.data() } as CorridaFinalizada);
      });
      this.zone.run(() => {
        this.minhasCorridas = lista;
        this.cdr.detectChanges();
      });
    });
  }

  selecionarMotorista(motorista: Motorista): void {
    if (this.agendamentoAtivo) {
      this.zone.run(() => {
        this.mostrarAlertaAgendamentoAtivo = true;
        this.cdr.detectChanges();
      });
      return;
    }
    this.motoristaSelecionado = motorista;
    this.rotaCalculada = false;
    this.tentouSubmeter = false;
    this.sugestoesOrigem = [];
    this.sugestoesDestino = [];
    this.dadosCorrida = {
      data: '',
      hora: '',
      origem: '',
      destino: '',
      distancia: 0,
      tempo: '',
      valorTotal: 0,
    };
    setTimeout(() => this.inicializarMapa(), 300);
  }

  private escutarAgendamentosAtivos(passageiroId: string): void {
    const q = query(
      collection(this.firestore, 'agendamentos'),
      where('idPassageiro', '==', passageiroId),
      where('status', 'in', ['Pendente', 'Aceito', 'Finalizado', 'Recusado']),
    );

    this.agendamentoSubscription = onSnapshot(q, (snapshot) => {
      this.zone.run(() => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const agendamento = docSnap.data() as Agendamento;
          agendamento.id = docSnap.id;

          this.idMotoristaDoAgendamento = agendamento.idMotorista;
          this.agendamentoBackup = { ...agendamento };

          if (agendamento.status === 'Finalizado') {
            this.agendamentoAtivo = agendamento;
            this.mostrarModalAvaliacao = true;
            this.destruirMapaEspera();
          } else {
            this.agendamentoAtivo = agendamento;
            this.buscarDadosMotoristaDoAgendamento(agendamento.idMotorista);
          }
          this.cdr.detectChanges();
        } else {
          this.agendamentoAtivo = null;
          this.motoristaDoAgendamento = null;
          this.destruirMapaEspera();
          this.cdr.detectChanges();
        }
      });
    });
  }

  async salvarAvaliacaoCorrida(): Promise<void> {
    const dadosParaSalvar = this.agendamentoAtivo ? this.agendamentoAtivo : this.agendamentoBackup;
    const motoristaIdRef = dadosParaSalvar
      ? dadosParaSalvar.idMotorista
      : this.idMotoristaDoAgendamento;

    if (!dadosParaSalvar || !motoristaIdRef) {
      this.mostrarModalAvaliacao = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      // ✅ ATUALIZADO: Agendamentos finalizados agora guardam todas as informações e a avaliação feita!
      await addDoc(collection(this.firestore, 'agendamentos_finalizados'), {
        idMotorista: dadosParaSalvar.idMotorista,
        idPassageiro: dadosParaSalvar.idPassageiro,
        nomeMotorista: this.motoristaDoAgendamento?.nomeCompleto || 'Motorista EliteDrive',
        localPartida: dadosParaSalvar.localPartida,
        localDestino: dadosParaSalvar.localDestino,
        distanciaKm: dadosParaSalvar.distanciaKm,
        valorTotal: dadosParaSalvar.valorTotal,
        dataCorrida: dadosParaSalvar.dataCorrida,
        horarioCorrida: dadosParaSalvar.horarioCorrida,
        horarioSolicitacao: dadosParaSalvar.horarioSolicitacao,
        status: 'Concluído',
        horarioConclusao: new Date().toISOString(),
        // Acoplado as notas e comentários diretamente na corrida para o Minhas Corridas
        notaMotorista: this.notaMotoristaTemp,
        notaVeiculo: this.notaVeiculoTemp,
        comentario: this.comentarioTemp || 'Sem observações.',
      });

      if (dadosParaSalvar.id) {
        await deleteDoc(doc(this.firestore, 'agendamentos', dadosParaSalvar.id));
      }

      await addDoc(collection(this.firestore, 'feedbacks'), {
        idMotorista: motoristaIdRef,
        nomePassageiro: this.nomePassageiro,
        notaMotorista: this.notaMotoristaTemp,
        notaVeiculo: this.notaVeiculoTemp,
        comentario: this.comentarioTemp || 'Sem observações.',
        dataFeedback: new Date().toISOString(),
      });

      const motoristaSnap = await getDoc(doc(this.firestore, 'motoristas', motoristaIdRef));
      if (motoristaSnap.exists()) {
        const dadosMotorista = motoristaSnap.data();
        let notaAtual = dadosMotorista['avaliacao'] != null ? dadosMotorista['avaliacao'] : 5.0;

        const qFeedbacks = query(
          collection(this.firestore, 'feedbacks'),
          where('idMotorista', '==', motoristaIdRef),
        );
        const snapFeedbacks = await getDocs(qFeedbacks);

        let contagemBaixas = 0;
        let contagemAltas = 0;

        snapFeedbacks.forEach((fDoc) => {
          const nota = fDoc.data()['notaMotorista'];
          if (nota <= 3) contagemBaixas++;
          if (nota >= 4) contagemAltas++;
        });

        if (contagemBaixas > 0 && contagemBaixas % 5 === 0 && this.notaMotoristaTemp <= 3) {
          notaAtual = parseFloat((notaAtual - 0.1).toFixed(1));
          if (notaAtual < 1.0) notaAtual = 1.0;
        }

        if (contagemAltas > 0 && contagemAltas % 5 === 0 && this.notaMotoristaTemp >= 4) {
          notaAtual = parseFloat((notaAtual + 0.1).toFixed(1));
          if (notaAtual > 5.0) notaAtual = 5.0;
        }

        await updateDoc(doc(this.firestore, 'motoristas', motoristaIdRef), {
          avaliacao: notaAtual,
        });
      }

      this.zone.run(() => {
        this.mostrarModalAvaliacao = false;
        this.agendamentoAtivo = null;
        this.agendamentoBackup = null;
        this.idMotoristaDoAgendamento = '';
        this.comentarioTemp = '';
        this.notaMotoristaTemp = 5;
        this.notaVeiculoTemp = 5;
        this.cdr.detectChanges();
      });
    } catch (e) {
      console.error(e);
      this.mostrarModalAvaliacao = false;
      this.cdr.detectChanges();
    }
  }

  private async buscarDadosMotoristaDoAgendamento(motoristaId: string): Promise<void> {
    try {
      const snap = await getDoc(doc(this.firestore, 'motoristas', motoristaId));
      if (snap.exists()) {
        this.zone.run(() => {
          this.motoristaDoAgendamento = snap.data() as Motorista;
          this.cdr.detectChanges();
          setTimeout(() => this.inicializarMapaEspera(), 300);
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async confirmarAgendamento(): Promise<void> {
    this.tentouSubmeter = true;
    if (
      !this.dadosCorrida.data ||
      !this.dadosCorrida.hora ||
      !this.dadosCorrida.origem ||
      !this.dadosCorrida.destino ||
      !this.rotaCalculada
    )
      return;
    try {
      const novoAgendamento: Agendamento = {
        idMotorista: this.motoristaSelecionado!.id!,
        idPassageiro: this.passageiroAtual!.id!,
        nomePassageiro: this.passageiroAtual!.nomeCompleto || 'Passageiro',
        telefonePassageiro: this.passageiroAtual!.telefone || '',
        localPartida: this.dadosCorrida.origem,
        localDestino: this.dadosCorrida.destino,
        distanciaKm: this.dadosCorrida.distancia,
        valorTotal: this.dadosCorrida.valorTotal,
        dataCorrida: this.dadosCorrida.data,
        horarioCorrida: this.dadosCorrida.hora,
        status: 'Pendente',
        horarioSolicitacao: new Date().toISOString(),
      };
      await addDoc(collection(this.firestore, 'agendamentos'), novoAgendamento);
      this.zone.run(() => {
        this.mostrarConfirmacaoPopUp = true;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error(error);
    }
  }

  buscarSugestoes(campo: 'origem' | 'destino', valor: string): void {
    if (!valor || valor.trim().length < 3) {
      if (campo === 'origem') this.sugestoesOrigem = [];
      else this.sugestoesDestino = [];
      return;
    }
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(valor + ', Salvador, Bahia')}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        this.zone.run(() => {
          const res = data.map((item: any) => item.display_name);
          if (campo === 'origem') this.sugestoesOrigem = res;
          else this.sugestoesDestino = res;
          this.cdr.detectChanges();
        });
      } catch {}
    }, 400);
  }

  selecionarSugestao(campo: 'origem' | 'destino', endereco: string): void {
    if (campo === 'origem') {
      this.dadosCorrida.origem = endereco;
      this.sugestoesOrigem = [];
    } else {
      this.dadosCorrida.destino = endereco;
      this.sugestoesDestino = [];
    }
    this.cdr.detectChanges();
    this.calcularRota();
  }

  async calcularRota(): Promise<void> {
    if (!this.dadosCorrida.origem || !this.dadosCorrida.destino) return;
    this.calculandoRota = true;
    this.rotaCalculada = false;
    this.cdr.detectChanges();
    try {
      const coordPartida = await this.buscarCoordenadas(this.dadosCorrida.origem);
      const coordDestino = await this.buscarCoordenadas(this.dadosCorrida.destino);
      if (coordPartida && coordDestino) {
        const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordPartida.lon},${coordPartida.lat};${coordDestino.lon},${coordDestino.lat}?overview=full&geometries=geojson`;
        const response = await fetch(urlOSRM);
        const data = await response.json();
        if (data && data.routes.length > 0) {
          const rota = data.routes[0];
          this.zone.run(() => {
            this.dadosCorrida.distancia = parseFloat((rota.distance / 1000).toFixed(1));
            this.dadosCorrida.tempo = `${Math.round(rota.duration / 60)} min`;
            this.dadosCorrida.valorTotal =
              this.dadosCorrida.distancia * (this.motoristaSelecionado?.valorPorKm || 3.5);
            const cam: [number, number][] = rota.geometry.coordinates.map((coord: any) => [
              coord[1],
              coord[0],
            ]);
            this.plotarMarcadores(
              [coordPartida.lat, coordPartida.lon],
              [coordDestino.lat, coordDestino.lon],
              cam,
            );
            this.calculandoRota = false;
            this.rotaCalculada = true;
            this.cdr.detectChanges();
          });
        }
      }
    } catch {
      this.calculandoRota = false;
      this.cdr.detectChanges();
    }
  }

  private async buscarCoordenadas(endereco: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco)}`,
      );
      const data = await res.json();
      return data.length > 0
        ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
        : null;
    } catch {
      return null;
    }
  }

  private plotarMarcadores(
    partida: [number, number],
    destino: [number, number],
    caminhoRuas?: [number, number][],
  ): void {
    if (!this.map || !this.markersGroup) return;
    this.markersGroup.clearLayers();
    L.marker(partida).addTo(this.markersGroup);
    L.marker(destino).addTo(this.markersGroup);
    if (caminhoRuas) {
      L.polyline(caminhoRuas, { color: '#ff6b00', weight: 6 }).addTo(this.markersGroup);
      this.map.fitBounds(L.latLngBounds(caminhoRuas), { padding: [40, 40] });
    }
  }

  private inicializarMapa(): void {
    if (this.map) this.destruirMapa();
    this.map = L.map('map').setView([-12.9714, -38.5014], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.markersGroup = L.layerGroup().addTo(this.map);
  }

  private inicializarMapaEspera(): void {
    if (this.mapEspera) this.destruirMapaEspera();
    try {
      this.mapEspera = L.map('map-espera', { zoomControl: false }).setView(
        [-12.9714, -38.5014],
        13,
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.mapEspera);
      this.markersGroupEspera = L.layerGroup().addTo(this.mapEspera);
      this.desenharRotaMapaEspera();
    } catch {}
  }

  private async desenharRotaMapaEspera(): Promise<void> {
    if (!this.agendamentoAtivo || !this.mapEspera) return;
    const p = await this.buscarCoordenadas(this.agendamentoAtivo.localPartida);
    const d = await this.buscarCoordenadas(this.agendamentoAtivo.localDestino);
    if (p && d && this.markersGroupEspera) {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${p.lon},${p.lat};${d.lon},${d.lat}?overview=full&geometries=geojson`,
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const cam = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
        this.markersGroupEspera.clearLayers();
        L.marker([p.lat, p.lon]).addTo(this.markersGroupEspera);
        L.marker([d.lat, d.lon]).addTo(this.markersGroupEspera);
        L.polyline(cam, { color: '#ff6b00', weight: 5 }).addTo(this.markersGroupEspera);
        this.mapEspera.fitBounds(L.latLngBounds(cam), { padding: [25, 25] });
      }
    }
  }

  private destruirMapa(): void {
    try {
      if (this.map) {
        this.map.off();
        this.map.remove();
      }
    } catch {}
  }
  private destruirMapaEspera(): void {
    try {
      if (this.mapEspera) {
        this.mapEspera.off();
        this.mapEspera.remove();
      }
    } catch {}
  }

  fecharPopUpDeConfirmacao(): void {
    this.mostrarConfirmacaoPopUp = false;
    this.fecharModal();
  }
  fecharAlertaAtivo(): void {
    this.mostrarAlertaAgendamentoAtivo = false;
  }
  alternarMenu(): void {
    this.menuLateralAberto = !this.menuLateralAberto;
  }

  // Transição nativa de abas do dashboard
  navegarInterno(destinoAba: 'solicitar' | 'historico'): void {
    this.abaAtiva = destinoAba;
    this.menuLateralAberto = false;
  }

  fecharModal(): void {
    this.destruirMapa();
    this.motoristaSelecionado = null;
  }
  abrirConfirmacaoCancelamento(): void {
    this.mostrarPopUpCancelamento = true;
  }
  fecharPopUpCancelamento(): void {
    this.mostrarPopUpCancelamento = false;
  }
  fecharPopUpCanceladoSucesso(): void {
    this.mostrarPopUpCanceladoSucesso = false;
    this.agendamentoAtivo = null;
  }

  async cancelarSolicitacaoReal(): Promise<void> {
    if (!this.agendamentoAtivo) return;
    try {
      await deleteDoc(doc(this.firestore, 'agendamentos', this.agendamentoAtivo.id!));
      this.zone.run(() => {
        this.mostrarPopUpCancelamento = false;
        this.mostrarPopUpCanceladoSucesso = true;
        this.cdr.detectChanges();
      });
    } catch {}
  }

  formatarData(dataString: string): string {
    if (!dataString) return '';
    const partes = dataString.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  async deslogar(): Promise<void> {
    if (confirm('Sair?')) {
      await this.auth.signOut();
      this.zone.run(() => this.router.navigate(['/login']));
    }
  }
}
