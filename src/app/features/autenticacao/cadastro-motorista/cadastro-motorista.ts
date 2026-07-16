import { Component, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { Autenticacao } from '../../../shared/services/autenticacao';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Router } from '@angular/router'; // 👈 Importação do Router adicionada

@Component({
  selector: 'app-cadastro-motorista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cadastro-motorista.html',
  styleUrl: './cadastro-motorista.css',
})
export class CadastroMotorista {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Autenticacao);
  private changeDetector = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);
  private zone = inject(NgZone);
  private router = inject(Router); // 👈 Injeção do Router adicionada

  passoAtual = 1;
  carregando = false;
  mensagemErroGeral: string | null = null;

  // Controles de Pop-ups (Mini Telas)
  mostrarPopUpErro: boolean = false;
  tituloPopUpErro: string = '';
  descricaoPopUpErro: string = '';

  mostrarPopUpSucesso: boolean = false; // 👈 Controle da nova mini tela de sucesso

  formulario = this.formBuilder.group({
    nomeCompleto: ['', [Validators.required]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    cidade: ['', [Validators.required]],
    telefone: ['', [Validators.required, Validators.minLength(11)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    fotoPerfil: ['', [Validators.required]],
    valorPorKm: ['', [Validators.required, Validators.min(1)]],

    marcaCarro: ['', [Validators.required]],
    modeloCarro: ['', [Validators.required]],
    placaCarro: ['', [Validators.required, Validators.minLength(7)]],
    corCarro: ['', [Validators.required]],
    fotoCarroExterna: ['', [Validators.required]],
    fotoCarroInterna: ['', [Validators.required]],
  });

  async cadastrar() {
    if (this.formulario.invalid) {
      this.mensagemErroGeral = 'Por favor, corrija os erros no formulário antes de finalizar.';
      return;
    }

    this.carregando = true;
    this.mensagemErroGeral = null;

    const dados = this.formulario.value;

    try {
      const colecaoMotoristas = collection(this.firestore, 'motoristas');

      // 🛑 1. VALIDAÇÃO DE TELEFONE DUPLICADO
      const queryTelefone = query(colecaoMotoristas, where('telefone', '==', dados.telefone));
      const snapTelefone = await getDocs(queryTelefone);
      if (!snapTelefone.empty) {
        this.dispararPopUpErro(
          'Telefone já Cadastrado',
          `Não foi possível concluir o cadastro porque o número de telefone (${dados.telefone}) já está associado a outro motorista parceiro.`,
        );
        this.carregando = false;
        return;
      }

      // 🛑 2. VALIDAÇÃO DE PLACA DE CARRO DUPLICADA
      const placaFormatada = dados.placaCarro?.trim().toUpperCase();
      const queryPlaca = query(colecaoMotoristas, where('placaCarro', '==', placaFormatada));
      const snapPlaca = await getDocs(queryPlaca);
      if (!snapPlaca.empty) {
        this.dispararPopUpErro(
          'Veículo já Cadastrado',
          `Não foi possível concluir o cadastro porque a placa de veículo (${placaFormatada}) já está registrada na plataforma.`,
        );
        this.carregando = false;
        return;
      }

      // Estruturação final
      const dadosFormatados = {
        nomeCompleto: dados.nomeCompleto,
        cpf: dados.cpf,
        cidade: dados.cidade,
        telefone: dados.telefone,
        email: dados.email,
        valorPorKm: dados.valorPorKm,
        fotoPerfilBase64: dados.fotoPerfil,
        marcaCarro: dados.marcaCarro,
        modeloCarro: dados.modeloCarro,
        placaCarro: placaFormatada,
        corCarro: dados.corCarro,
        fotoCarroExternaBase64: dados.fotoCarroExterna,
        fotoCarroInternaBase64: dados.fotoCarroInterna,
        avaliacao: 5.0,
      };

      await this.authService.criarMotorista(dadosFormatados as any, dados.senha as string);

      // ✅ ATIVA MINI TELA DE SUCESSO
      this.zone.run(() => {
        this.mostrarPopUpSucesso = true;
        this.formulario.reset();
        this.passoAtual = 1;
        this.changeDetector.detectChanges();
      });
    } catch (error: any) {
      console.error('Erro ao registrar motorista:', error);

      // 🛑 3. VALIDAÇÃO DE E-MAIL DUPLICADO (INTERCEPTADO VIA AUTH)
      if (
        error.code === 'auth/email-already-in-use' ||
        error.message?.includes('email-already-in-use')
      ) {
        this.dispararPopUpErro(
          'E-mail já Cadastrado',
          `Não foi possível concluir o cadastro porque o endereço de e-mail (${dados.email}) já possui uma conta ativa no EliteDrive.`,
        );
      } else if (error.message?.includes('size') && error.message?.includes('exceeds')) {
        this.dispararPopUpErro(
          'Fotos Grandes Demais',
          'O tamanho somado das fotos do veículo e perfil excedeu o limite máximo do banco. Escolha arquivos de imagem mais leves ou reduza a qualidade delas.',
        );
      } else {
        this.mensagemErroGeral =
          'Ocorreu um erro ao processar seu cadastro. Verifique os dados inseridos e tente novamente.';
      }
    } finally {
      this.carregando = false;
      this.changeDetector.detectChanges();
    }
  }

  dispararPopUpErro(titulo: string, descricao: string) {
    this.zone.run(() => {
      this.tituloPopUpErro = titulo;
      this.descricaoPopUpErro = descricao;
      this.mostrarPopUpErro = true;
      this.changeDetector.detectChanges();
    });
  }

  fecharPopUpErro() {
    this.mostrarPopUpErro = false;
    this.changeDetector.detectChanges();
  }

  // ✅ NOVO: AÇÕES DO POP-UP DE SUCESSO
  irParaLogin() {
    this.mostrarPopUpSucesso = false;
    this.router.navigate(['/login']);
  }

  fecharPopUpSucesso() {
    this.mostrarPopUpSucesso = false;
    this.changeDetector.detectChanges();
  }

  selecionarFoto(event: any, nomeCampo: string) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = (e: any) => {
        const imagemOriginal = new Image();
        imagemOriginal.src = e.target.result;

        imagemOriginal.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          const larguraMaxima = 800;
          let novaLargura = imagemOriginal.width;
          let novaAltura = imagemOriginal.height;

          if (novaLargura > larguraMaxima) {
            novaAltura = Math.round((larguraMaxima * novaAltura) / novaLargura);
            novaLargura = larguraMaxima;
          }

          canvas.width = novaLargura;
          canvas.height = novaAltura;

          if (ctx) {
            ctx.drawImage(imagemOriginal, 0, 0, novaLargura, novaAltura);
            const base64Comprimido = canvas.toDataURL('image/jpeg', 0.7);

            this.formulario.patchValue({ [nomeCampo]: base64Comprimido });
            this.formulario.get(nomeCampo)?.markAsDirty();
            this.formulario.get(nomeCampo)?.markAsTouched();
            this.changeDetector.detectChanges();
          }
        };
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  avancarPassoForm() {
    this.mensagemErroGeral = null;
    const camposPassoMotorista = [
      'nomeCompleto',
      'cpf',
      'cidade',
      'telefone',
      'email',
      'senha',
      'fotoPerfil',
      'valorPorKm',
    ];

    let camposPassoMotoristaValido = true;
    camposPassoMotorista.forEach((campoForm) => {
      let campo = this.formulario.get(campoForm);
      if (campo?.invalid) {
        camposPassoMotoristaValido = false;
        campo.markAllAsTouched();
      }
    });

    if (camposPassoMotoristaValido) {
      this.passoAtual = 2;
    } else {
      this.mensagemErroGeral = 'Preencha todos os campos obrigatórios do primeiro passo.';
    }
    this.changeDetector.detectChanges();
  }
}
