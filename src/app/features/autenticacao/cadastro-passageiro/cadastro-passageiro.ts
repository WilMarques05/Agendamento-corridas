import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Autenticacao } from '../../../shared/services/autenticacao';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Passageiro } from '../../../shared/models/passageiro.model';

@Component({
  selector: 'app-cadastro-passageiro',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-passageiro.html',
  styleUrl: './cadastro-passageiro.css',
})
export class CadastroPassageiro {
  private authService = inject(Autenticacao);
  private changeDetector = inject(ChangeDetectorRef);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  exibirModal: boolean = false;
  tituloModal: string = '';
  mensagemModal: string = '';
  isErro: boolean = false;

  formulario = this.formBuilder.group({
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    foto: ['', [Validators.required]],
    aceitaTermos: [false, [Validators.requiredTrue]] // Nova validação
  });

  async cadastrar() {
    if (this.formulario.valid) {
      try {
        const valores = this.formulario.value;
        const dadosPassageiro: Passageiro = {
          nomeCompleto: valores.nome || '',
          cpf: valores.cpf || '',
          telefone: valores.telefone || '',
          email: valores.email || '',
          fotoPerfilBase64: valores.foto || '',
          avaliacao: 5.0
        };

        await this.authService.criarPassageiro(dadosPassageiro, valores.senha as string);
        this.configurarModal('Cadastro Realizado!', 'Sua conta foi criada com sucesso.', false);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          this.configurarModal('Erro', 'Este e-mail já está cadastrado no sistema.', true);
        } else {
          this.configurarModal('Erro', 'Erro: ' + error.message, true);
        }
      }
    } else {
      this.formulario.markAllAsTouched();
    }
  }

  private configurarModal(titulo: string, mensagem: string, erro: boolean) {
    this.tituloModal = titulo;
    this.mensagemModal = mensagem;
    this.isErro = erro;
    this.exibirModal = true;
    this.changeDetector.detectChanges();
  }

  fecharModal() {
    this.exibirModal = false;
    this.formulario.reset({ aceitaTermos: false }); // Reset mantendo o checkbox desmarcado
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
  }

  irParaLogin() {
    this.fecharModal();
    this.router.navigate(['/login']);
  }

  selecionarFoto(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = () => {
        const img = new Image();
        img.src = leitor.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 300;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          this.formulario.patchValue({ foto: canvas.toDataURL('image/jpeg', 0.7) });
          this.changeDetector.detectChanges();
        };
      };
      leitor.readAsDataURL(arquivo);
    }
  }
}


// import { Component, inject, ChangeDetectorRef } from '@angular/core';
// import { Router } from '@angular/router';
// import { Autenticacao } from '../../../shared/services/autenticacao';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Passageiro } from '../../../shared/models/passageiro.model';

// @Component({
//   selector: 'app-cadastro-passageiro',
//   standalone: true,
//   imports: [ReactiveFormsModule],
//   templateUrl: './cadastro-passageiro.html',
//   styleUrl: './cadastro-passageiro.css',
// })
// export class CadastroPassageiro {
//   private authService = inject(Autenticacao);
//   private changeDetector = inject(ChangeDetectorRef);
//   private formBuilder = inject(FormBuilder);
//   private router = inject(Router);

//   // Estados do Modal
//   exibirModal: boolean = false;
//   tituloModal: string = '';
//   mensagemModal: string = '';
//   isErro: boolean = false;

//   formulario = this.formBuilder.group({
//     nome: ['', [Validators.required]],
//     cpf: ['', [Validators.required, Validators.minLength(11)]],
//     telefone: ['', [Validators.required]],
//     email: ['', [Validators.required, Validators.email]],
//     senha: ['', [Validators.required, Validators.minLength(6)]],
//     foto: ['', [Validators.required]]
//   });

//   async cadastrar() {
//     if (this.formulario.valid) {
//       try {
//         const valores = this.formulario.value;
//         const dadosPassageiro: Passageiro = {
//           nomeCompleto: valores.nome || '',
//           cpf: valores.cpf || '',
//           telefone: valores.telefone || '',
//           email: valores.email || '',
//           fotoPerfilBase64: valores.foto || '',
//           avaliacao: 5.0
//         };

//         await this.authService.criarPassageiro(dadosPassageiro, valores.senha as string);

//         this.configurarModal('Cadastro Realizado!', 'Sua conta foi criada com sucesso.', false);
//       } catch (error: any) {
//         if (error.code === 'auth/email-already-in-use') {
//           this.configurarModal('Erro', 'Este e-mail já está cadastrado no sistema.', true);
//         } else {
//           this.configurarModal('Erro', 'Ocorreu um erro: ' + error.message, true);
//         }
//       }
//     } else {
//       this.formulario.markAllAsTouched();
//     }
//   }

//   private configurarModal(titulo: string, mensagem: string, erro: boolean) {
//     this.tituloModal = titulo;
//     this.mensagemModal = mensagem;
//     this.isErro = erro;
//     this.exibirModal = true;
//     this.changeDetector.detectChanges();
//   }

//   fecharModal() {
//     this.exibirModal = false;
//     this.formulario.reset();
//     this.formulario.markAsPristine();
//     this.formulario.markAsUntouched();
//     this.changeDetector.detectChanges();
//   }

//   irParaLogin() {
//     this.formulario.reset();
//     this.formulario.markAsPristine();
//     this.formulario.markAsUntouched();
//     this.router.navigate(['/login']);
//   }

//   selecionarFoto(event: any) {
//     const arquivo = event.target.files[0];
//     if (arquivo) {
//       const leitor = new FileReader();
//       leitor.onload = () => {
//         const img = new Image();
//         img.src = leitor.result as string;
//         img.onload = () => {
//           const canvas = document.createElement('canvas');
//           const MAX_WIDTH = 300;
//           const scaleSize = MAX_WIDTH / img.width;
//           canvas.width = MAX_WIDTH;
//           canvas.height = img.height * scaleSize;
//           const ctx = canvas.getContext('2d');
//           ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
//           this.formulario.patchValue({ foto: canvas.toDataURL('image/jpeg', 0.7) });
//           this.changeDetector.detectChanges();
//         };
//       };
//       leitor.readAsDataURL(arquivo);
//     }
//   }
// }
