import { Component, inject } from '@angular/core';
import { idToken } from '@angular/fire/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'

@Component({
  selector: 'app-cadastro-passageiro',
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-passageiro.html',
  styleUrl: './cadastro-passageiro.css',
})
export class CadastroPassageiro {
  private formBuilder = inject(FormBuilder);
  formulario = this.formBuilder.group({
    nome: ['', [Validators.required]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    telefone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['',[Validators.required, Validators.minLength(6)]]
  });

  cadastrar(){
    if(this.formulario.valid){
      console.log('Dados prontos para firebase:', this.formulario.value);
    }else{
      console.log('Formulário inválido! Verifique os campos.' );
    }
  }
}
