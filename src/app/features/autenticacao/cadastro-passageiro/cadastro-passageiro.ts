import { Component, inject } from '@angular/core';
import { Autenticacao } from '../../../shared/services/autenticacao';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'

@Component({
  selector: 'app-cadastro-passageiro',
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-passageiro.html',
  styleUrl: './cadastro-passageiro.css',
})
export class CadastroPassageiro {

  private authService = inject(Autenticacao);

  private formBuilder = inject(FormBuilder);
  formulario = this.formBuilder.group({
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['',[Validators.required, Validators.minLength(6)]]
  });

  async cadastrar(){
    if(this.formulario.valid){
      const {senha, ...dadosSemSenha} = this.formulario.value;
      await this.authService.criarPassageiro(dadosSemSenha as any, senha as string);
      console.log('Passageiro cadastrado com sucesso no Firebase');
      this.formulario.reset();
    }else{
      console.log('Formulário inválido! Verifique os campos.' );
    }
  }
}
