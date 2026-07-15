import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Autenticacao } from '../../../shared/services/autenticacao';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Passageiro } from '../../../shared/models/passageiro.model'; // Ajuste o caminho da interface se necessário

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

  formulario = this.formBuilder.group({
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    foto: ['', [Validators.required]]
  });

  async cadastrar() {
    if (this.formulario.valid) {
      try {
        const valores = this.formulario.value;
        const senha = valores.senha as string;

        // Montamos o objeto respeitando rigorosamente o modelo 'Passageiro'
        const dadosPassageiro: Passageiro = {
          nomeCompleto: valores.nome || '',
          cpf: valores.cpf || '',
          telefone: valores.telefone || '',
          email: valores.email || '',
          fotoPerfilBase64: valores.foto || '',
          avaliacao: 5.0 // Inicializa com a nota padrão
        };

        // Envia para o serviço criar a autenticação e gravar no Firestore
        await this.authService.criarPassageiro(dadosPassageiro, senha);

        console.log('Passageiro cadastrado com sucesso no Firebase!');
        alert('Cadastro realizado com sucesso!');

        this.formulario.reset();

        // Redireciona o usuário direto para o login após cadastrar
        this.router.navigate(['/login']);

      } catch (error: any) {
        console.error('Erro ao cadastrar passageiro:', error);
        alert('Ocorreu um erro ao realizar o cadastro: ' + error.message);
      }
    } else {
      console.log('Formulário inválido! Verifique os campos.');
      // Marca todos os campos como tocados para exibir os erros em vermelho na tela
      this.formulario.markAllAsTouched();
    }
  }

  selecionarFoto(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = () => {
        this.formulario.patchValue({ foto: leitor.result as string });
        this.changeDetector.detectChanges();
        this.formulario.get('foto')?.markAsDirty();
      };
      leitor.readAsDataURL(arquivo);
    }
  }
}







// import { Component, inject, ChangeDetectorRef } from '@angular/core';
// import { Autenticacao } from '../../../shared/services/autenticacao';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'

// @Component({
//   selector: 'app-cadastro-passageiro',
//   imports: [ReactiveFormsModule],
//   templateUrl: './cadastro-passageiro.html',
//   styleUrl: './cadastro-passageiro.css',
// })
// export class CadastroPassageiro {
//   private authService = inject(Autenticacao);
//   private changeDetector = inject(ChangeDetectorRef);
//   private formBuilder = inject(FormBuilder);

//   formulario = this.formBuilder.group({
//     nome: ['', [Validators.required]],
//     cpf: ['', [Validators.required, Validators.minLength(11)]],
//     telefone: ['', [Validators.required]],
//     email: ['', [Validators.required, Validators.email]],
//     senha: ['',[Validators.required, Validators.minLength(6)]],
//     foto: ['', [Validators.required]]
//   });

//   async cadastrar(){
//     if(this.formulario.valid){
//       const {senha, ...dadosSemSenha} = this.formulario.value;
//       await this.authService.criarPassageiro(dadosSemSenha as any, senha as string);
//       console.log('Passageiro cadastrado com sucesso no Firebase');
//       this.formulario.reset();
//     }else{
//       console.log('Formulário inválido! Verifique os campos.' );
//     }
//   }

//   selecionarFoto(event: any){
//     const arquivo = event.target.files[0];
//     if(arquivo){
//       const leitor = new FileReader();
//         leitor.onload = () => {
//           this.formulario.patchValue({foto: leitor.result as string});
//           this.changeDetector.detectChanges();
//           this.formulario.get('foto')?.markAsDirty();
//         }
//       leitor.readAsDataURL(arquivo);
//     }
//   }
// }
