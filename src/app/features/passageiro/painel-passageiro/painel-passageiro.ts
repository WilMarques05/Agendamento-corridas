import { Agendamento } from './../../../shared/models/agendamento.model';
import { Passageiro } from '../../../shared/models/passageiro.model';
import { Motorista } from '../../../shared/models/motorista.model';
import { Component, inject, OnInit, OnDestroy, Injector, runInInjectionContext, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, onSnapshot } from '@angular/fire/firestore';

import * as L from 'leaflet';

@Component({
  selector: 'app-painel-passageiro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-passageiro.html',
  styleUrl: './painel-passageiro.css'
})
export class PainelPassageiro implements OnInit, OnDestroy {
  // Injeções
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  // Informações do Passageiro Logado
  passageiroAtual: Passageiro | null = null;
  nomePassageiro: string = 'Carregando...';
  fotoPassageiro: string = '';

  // Controles de Interface
  menuLateralAberto: boolean = false;
  calculandoRota: boolean = false;
  rotaCalculada: boolean = false;

  // Controles de Validação Visual dos Campos
  tentouSubmeter: boolean = false;

  // Pop-ups de Fluxo Positivo (Agendamento)
  mostrarConfirmacaoPopUp: boolean = false;
  mostrarAlertaAgendamentoAtivo: boolean = false;

  // Pop-ups de Fluxo Negativo (Cancelamento)
  mostrarPopUpCancelamento: boolean = false;
  mostrarPopUpCanceladoSucesso: boolean = false;

  // Validação de Data Mínima (Hoje)
  dataMinima: string = '';

  // Autocomplete / Sugestões de Endereço
  sugestoesOrigem: string[] = [];
  sugestoesDestino: string[] = [];
  private debounceTimer: any;

  // Mapas
  private map!: L.Map;
  private markersGroup!: L.LayerGroup;

  private mapEspera!: L.Map;
  private markersGroupEspera!: L.LayerGroup;

  // Listas e Seleções
  motoristas: Motorista[] = [];
  motoristaSelecionado: Motorista | null = null;
  agendamentoAtivo: Agendamento | null = null;
  motoristaDoAgendamento: Motorista | null = null;

  private agendamentoSubscription: any = null;

  // Formulário de Corrida
  dadosCorrida = {
    data: '',
    hora: '',
    origem: '',
    destino: '',
    distancia: 0,
    tempo: '',
    valorTotal: 0
  };

  ngOnInit(): void {
    this.calcularDataMinima();
    runInInjectionContext(this.injector, () => {
      this.zone.run(() => {
        this.obterDadosPassageiro();
        this.carregarMotoristasFirebase();
      });
    });
  }

  ngOnDestroy(): void {
    this.destruirMapa();
    this.destruirMapaEspera();
    if (this.agendamentoSubscription) {
      this.agendamentoSubscription();
    }
  }

  private calcularDataMinima(): void {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    this.dataMinima = `${ano}-${mes}-${dia}`;
  }

  // 👤 CARREGAR PASSAGEIRO LOGADO
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
              this.cdr.detectChanges();
            });
          } else {
            console.warn('Documento do passageiro não encontrado no Firestore para o UID:', user.uid);
            this.zone.run(() => {
              this.passageiroAtual = {
                id: user.uid,
                nomeCompleto: 'Passageiro de Teste',
                telefone: '(71) 99999-9999',
                cpf: '000.000.000-00',
                email: user.email || 'teste@elitedrive.com',
                fotoPerfilBase64: '',
                avaliacao: 5.0
              };
              this.nomePassageiro = 'Passageiro de Teste';

              this.escutarAgendamentosAtivos(user.uid);
              this.cdr.detectChanges();
            });
          }
        } catch (error) {
          console.error('Erro ao buscar dados do passageiro:', error);
          this.zone.run(() => {
            this.nomePassageiro = 'Usuário';
            this.cdr.detectChanges();
          });
        }
      } else {
        this.zone.run(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  // 🚗 CARREGAR LISTA DE MOTORISTAS DO FIRESTORE
  private async carregarMotoristasFirebase(): Promise<void> {
    try {
      const colecaoRef = collection(this.firestore, 'motoristas');
      const querySnapshot = await getDocs(colecaoRef);
      const lista: Motorista[] = [];

      querySnapshot.forEach((docSnap) => {
        const dados = docSnap.data() as any;

        const filtrarBlob = (url: string | undefined): string => {
          if (!url || url.startsWith('blob:')) return '';
          return url;
        };

        const motoristaFormatado: Motorista = {
          id: docSnap.id,
          nomeCompleto: dados.nomeCompleto || 'Motorista',
          cidade: dados.cidade || 'Salvador',
          telefone: dados.telefone || '',
          email: dados.email || '',
          avaliacao: dados.avaliacao != null ? dados.avaliacao : 5.0,
          valorPorKm: dados.valorPorKm || 3.50,
          modeloCarro: dados.modeloCarro || 'Veículo',
          placaCarro: dados.placaCarro || '',
          corCarro: dados.corCarro || '',
          fotoPerfilBase64: filtrarBlob(dados.fotoPerfil),
          fotoCarroInternaBase64: filtrarBlob(dados.fotoCarroInterna),
          fotoCarroExternaBase64: filtrarBlob(dados.fotoCarroExterna)
        };

        lista.push(motoristaFormatado);
      });

      this.zone.run(() => {
        this.motoristas = lista;
        this.cdr.detectChanges();
      });

    } catch (error) {
      console.error('Erro ao buscar motoristas no Firestore:', error);
    }
  }

  // CONTROLE DO MENU MOBILE
  alternarMenu(): void {
    this.menuLateralAberto = !this.menuLateralAberto;
    this.cdr.detectChanges();
  }

  navegarInterno(): void {
    this.menuLateralAberto = false;
    this.cdr.detectChanges();
  }

  // SELECIONAR MOTORISTA E ABRIR MODAL
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
    this.tentouSubmeter = false; // Reseta validador visual
    this.sugestoesOrigem = [];
    this.sugestoesDestino = [];
    this.dadosCorrida = {
      data: '',
      hora: '',
      origem: '',
      destino: '',
      distancia: 0,
      tempo: '',
      valorTotal: 0
    };

    setTimeout(() => {
      this.inicializarMapa();
    }, 300);
  }

  fecharModal(): void {
    this.destruirMapa();
    this.motoristaSelecionado = null;
    this.mostrarConfirmacaoPopUp = false;
  }

  fecharAlertaAtivo(): void {
    this.mostrarAlertaAgendamentoAtivo = false;
    this.cdr.detectChanges();
  }

  // 🔍 AUTOCOMPLETE: BUSCAR SUGESTÕES
  buscarSugestoes(campo: 'origem' | 'destino', valor: string): void {
    if (!valor || valor.trim().length < 3) {
      if (campo === 'origem') this.sugestoesOrigem = [];
      else this.sugestoesDestino = [];
      return;
    }

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(async () => {
      const queryStr = encodeURIComponent(`${valor}, Salvador, Bahia, Brasil`);
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&q=${queryStr}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        this.zone.run(() => {
          const resultados = data.map((item: any) => item.display_name);
          if (campo === 'origem') {
            this.sugestoesOrigem = resultados;
          } else {
            this.sugestoesDestino = resultados;
          }
          this.cdr.detectChanges();
        });
      } catch (e) {
        console.error('Erro ao buscar sugestões de endereço:', e);
      }
    }, 400);
  }

  // 📍 AUTOCOMPLETE: SELECIONAR ENDEREÇO
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

  // MAPA MODAL AGENDAMENTO
  private inicializarMapa(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map('map').setView([-12.9714, -38.5014], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersGroup = L.layerGroup().addTo(this.map);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 150);
  }

  private destruirMapa(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }

  // MAPA EXCLUSIVO DO CARD DE ESPERA
  private inicializarMapaEspera(): void {
    const mapEsperaElement = document.getElementById('map-espera');
    if (!mapEsperaElement) return;

    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.mapEspera = L.map('map-espera', { zoomControl: false }).setView([-12.9714, -38.5014], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapEspera);

    this.markersGroupEspera = L.layerGroup().addTo(this.mapEspera);

    setTimeout(() => {
      if (this.mapEspera) {
        this.mapEspera.invalidateSize();
        this.desenharRotaMapaEspera();
      }
    }, 300);
  }

  private destruirMapaEspera(): void {
    if (this.mapEspera) {
      this.mapEspera.off();
      this.mapEspera.remove();
    }
  }

  private async desenharRotaMapaEspera(): Promise<void> {
    if (!this.agendamentoAtivo || !this.mapEspera || !this.markersGroupEspera) return;

    try {
      const coordPartida = await this.buscarCoordenadas(this.agendamentoAtivo.localPartida);
      const coordDestino = await this.buscarCoordenadas(this.agendamentoAtivo.localDestino);

      if (!coordPartida || !coordDestino) return;

      const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordPartida.lon},${coordPartida.lat};${coordDestino.lon},${coordDestino.lat}?overview=full&geometries=geojson`;
      const response = await fetch(urlOSRM);
      const data = await response.json();

      if (data && data.routes && data.routes.length > 0) {
        const rota = data.routes[0];
        const coordenadasGeometria: [number, number][] = rota.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);

        this.markersGroupEspera.clearLayers();

        L.marker([coordPartida.lat, coordPartida.lon])
          .bindPopup(`<b>Partida:</b> ${this.agendamentoAtivo.localPartida}`)
          .addTo(this.markersGroupEspera);

        L.marker([coordDestino.lat, coordDestino.lon])
          .bindPopup(`<b>Destino:</b> ${this.agendamentoAtivo.localDestino}`)
          .addTo(this.markersGroupEspera);

        L.polyline(coordenadasGeometria, {
          color: '#ff6b00',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round'
        }).addTo(this.markersGroupEspera);

        const bounds = L.latLngBounds(coordenadasGeometria);
        this.mapEspera.fitBounds(bounds, { padding: [25, 25] });
      }
    } catch (e) {
      console.error('Erro ao desenhar trajeto de espera:', e);
    }
  }

  // CÁLCULO DE ROTA REAL CURVA A CURVA (OSRM API)
  async calcularRota(): Promise<void> {
    if (!this.dadosCorrida.origem || !this.dadosCorrida.destino) {
      return;
    }

    this.calculandoRota = true;
    this.rotaCalculada = false;
    this.cdr.detectChanges();

    try {
      const coordPartida = await this.buscarCoordenadas(this.dadosCorrida.origem);
      const coordDestino = await this.buscarCoordenadas(this.dadosCorrida.destino);

      if (!coordPartida || !coordDestino) {
        this.zone.run(() => {
          this.calculandoRota = false;
          this.cdr.detectChanges();
        });
        return;
      }

      const urlOSRM = `https://router.project-osrm.org/route/v1/driving/${coordPartida.lon},${coordPartida.lat};${coordDestino.lon},${coordDestino.lat}?overview=full&geometries=geojson`;
      const response = await fetch(urlOSRM);
      const data = await response.json();

      if (data && data.routes && data.routes.length > 0) {
        const rota = data.routes[0];
        const distanciaRealKm = parseFloat((rota.distance / 1000).toFixed(1));
        const tempoRealMinutos = Math.round(rota.duration / 60);
        const coordenadasGeometria: [number, number][] = rota.geometry.coordinates.map((coord: any) => [coord[1], coord[0]]);

        this.zone.run(() => {
          this.dadosCorrida.distancia = distanciaRealKm;
          this.dadosCorrida.tempo = `${tempoRealMinutos} minutos`;

          const precoPorKm = this.motoristaSelecionado?.valorPorKm || 3.50;
          this.dadosCorrida.valorTotal = distanciaRealKm * precoPorKm;

          this.plotarMarcadores(
            [coordPartida.lat, coordPartida.lon],
            [coordDestino.lat, coordDestino.lon],
            coordenadasGeometria
          );

          this.calculandoRota = false;
          this.rotaCalculada = true;
          this.cdr.detectChanges();
        });
      } else {
        throw new Error('Não foi possível calcular a rota.');
      }

    } catch (error) {
      console.error('Erro no cálculo de rota real:', error);
      this.zone.run(() => {
        this.calculandoRota = false;
        this.cdr.detectChanges();
      });
    }
  }

  private async buscarCoordenadas(endereco: string): Promise<{lat: number, lon: number} | null> {
    const queryCompleta = endereco.toLowerCase().includes('salvador')
      ? endereco
      : `${endereco}, Salvador, Bahia, Brasil`;

    const queryStr = encodeURIComponent(queryCompleta);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${queryStr}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (e) {
      console.error('Erro na busca de coordenadas:', e);
      return null;
    }
  }

  private plotarMarcadores(partida: [number, number], destino: [number, number], caminhoRuas?: [number, number][]): void {
    if (!this.map || !this.markersGroup) return;

    this.markersGroup.clearLayers();

    L.marker(partida)
      .bindPopup(`<b>Partida:</b> ${this.dadosCorrida.origem}`)
      .addTo(this.markersGroup)
      .openPopup();

    L.marker(destino)
      .bindPopup(`<b>Destino:</b> ${this.dadosCorrida.destino}`)
      .addTo(this.markersGroup);

    if (caminhoRuas && caminhoRuas.length > 0) {
      L.polyline(caminhoRuas, {
        color: '#ff6b00',
        weight: 6,
        opacity: 0.85,
        lineJoin: 'round'
      }).addTo(this.markersGroup);

      const bounds = L.latLngBounds(caminhoRuas);
      this.map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      L.polyline([partida, destino], { color: '#ff6b00', weight: 5, opacity: 0.8 }).addTo(this.markersGroup);
      const bounds = L.latLngBounds([partida, destino]);
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  // GRAVAR AGENDAMENTO REAL NO FIRESTORE
  async confirmarAgendamento(): Promise<void> {
    this.tentouSubmeter = true; // Ativa a verificação visual dos erros em vermelho abaixo dos inputs

    // 🛑 SE HOUVER CAMPOS EM BRANCO, BLOQUEIA DIRETAMENTE SEM TOASTS/ALERTS
    if (!this.dadosCorrida.data || !this.dadosCorrida.hora || !this.dadosCorrida.origem || !this.dadosCorrida.destino) {
      this.cdr.detectChanges();
      return;
    }

    // 🛑 REGRA DE HORÁRIO RETROATIVO
    if (this.dadosCorrida.data === this.dataMinima) {
      const agora = new Date();
      const horaAtualStr = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

      if (this.dadosCorrida.hora < horaAtualStr) {
        alert(`Horário inválido! O relógio atual marca ${horaAtualStr}. Escolha um horário futuro.`);
        return;
      }
    }

    if (!this.rotaCalculada) {
      return;
    }

    if (!this.passageiroAtual || !this.motoristaSelecionado) {
      return;
    }

    try {
      const novoAgendamento: Agendamento = {
        idMotorista: this.motoristaSelecionado.id!,
        idPassageiro: this.passageiroAtual.id!,
        nomePassageiro: this.passageiroAtual.nomeCompleto || 'Passageiro',
        telefonePassageiro: this.passageiroAtual.telefone || '',
        localPartida: this.dadosCorrida.origem,
        localDestino: this.dadosCorrida.destino,
        distanciaKm: this.dadosCorrida.distancia,
        valorTotal: this.dadosCorrida.valorTotal,
        dataCorrida: this.dadosCorrida.data,
        horarioCorrida: this.dadosCorrida.hora,
        status: 'Pendente',
        horarioSolicitacao: new Date().toISOString()
      };

      const colecaoAgendamentos = collection(this.firestore, 'agendamentos');
      await addDoc(colecaoAgendamentos, novoAgendamento);

      this.zone.run(() => {
        this.mostrarConfirmacaoPopUp = true;
        this.cdr.detectChanges();
      });

    } catch (error) {
      console.error('Erro ao salvar agendamento no Firestore:', error);
    }
  }

  fecharPopUpDeConfirmacao(): void {
    this.zone.run(() => {
      this.mostrarConfirmacaoPopUp = false;
      this.fecharModal();
      this.cdr.detectChanges();
    });
  }

  // ESCUTAR AGENDAMENTOS EM TEMPO REAL
  private escutarAgendamentosAtivos(passageiroId: string): void {
    const colecaoRef = collection(this.firestore, 'agendamentos');

    const q = query(
      colecaoRef,
      where('idPassageiro', '==', passageiroId),
      where('status', 'in', ['Pendente', 'Aceito'])
    );

    this.agendamentoSubscription = onSnapshot(q, (snapshot) => {
      this.zone.run(() => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          this.agendamentoAtivo = docSnap.data() as Agendamento;
          this.agendamentoAtivo.id = docSnap.id;

          this.buscarDadosMotoristaDoAgendamento(this.agendamentoAtivo.idMotorista);
        } else {
          this.agendamentoAtivo = null;
          this.motoristaDoAgendamento = null;
          this.destruirMapaEspera();
          this.cdr.detectChanges();
        }
      });
    });
  }

  private async buscarDadosMotoristaDoAgendamento(motoristaId: string): Promise<void> {
    try {
      const motoristaRef = doc(this.firestore, 'motoristas', motoristaId);
      const snap = await getDoc(motoristaRef);
      if (snap.exists()) {
        this.zone.run(() => {
          this.motoristaDoAgendamento = snap.data() as Motorista;
          this.cdr.detectChanges();

          setTimeout(() => {
            this.inicializarMapaEspera();
          }, 300);
        });
      }
    } catch (error) {
      console.error('Erro ao buscar motorista do agendamento:', error);
    }
  }

  // CANCELAR
  abrirConfirmacaoCancelamento(): void {
    if (!this.agendamentoAtivo || !this.agendamentoAtivo.id) return;
    this.mostrarPopUpCancelamento = true;
    this.cdr.detectChanges();
  }

  fecharPopUpCancelamento(): void {
    this.mostrarPopUpCancelamento = false;
    this.cdr.detectChanges();
  }

  // 🛑 EXCLUI A SOLICITAÇÃO DEFINITIVAMENTE DO BANCO DE DADOS (Quando o passageiro desiste)
  async cancelarSolicitacaoReal(): Promise<void> {
    if (!this.agendamentoAtivo || !this.agendamentoAtivo.id) return;

    try {
      const agendamentoRef = doc(this.firestore, 'agendamentos', this.agendamentoAtivo.id);

      // Deleta o documento do Firestore permanentemente
      await deleteDoc(agendamentoRef);

      this.zone.run(() => {
        this.mostrarPopUpCancelamento = false;   // Fecha a pergunta de atenção
        this.mostrarPopUpCanceladoSucesso = true; // Abre a mini tela de sucesso
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Erro ao deletar agendamento do Firestore:', error);
    }
  }

  fecharPopUpCanceladoSucesso(): void {
    this.zone.run(() => {
      this.mostrarPopUpCanceladoSucesso = false;
      this.destruirMapaEspera();
      this.agendamentoAtivo = null;
      this.motoristaDoAgendamento = null;
      this.cdr.detectChanges();
    });
  }

  formatarData(dataString: string): string {
    if (!dataString) return '';
    const partes = dataString.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  async deslogar(): Promise<void> {
    const confirmar = confirm('Deseja realmente sair do sistema?');
    if (!confirmar) return;

    await runInInjectionContext(this.injector, async () => {
      try {
        await this.auth.signOut();
        this.zone.run(() => {
          this.router.navigate(['/login']);
        });
      } catch (error) {
        console.error('Erro ao deslogar:', error);
      }
    });
  }
}
