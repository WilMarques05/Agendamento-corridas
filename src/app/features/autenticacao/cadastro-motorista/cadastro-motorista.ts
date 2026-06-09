import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Autenticacao } from '../../../shared/services/autenticacao';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-cadastro-motorista',
  imports: [ReactiveFormsModule],
  templateUrl: './cadastro-motorista.html',
  styleUrl: './cadastro-motorista.css',
})
export class CadastroMotorista {
  private formBuilder = inject(FormBuilder);
  private authService = inject(Autenticacao);
  private changeDetector = inject(ChangeDetectorRef);

  formulario = this.formBuilder.group({
    nomeCompleto: ['', [Validators.required]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    cidade: ['', [Validators.required]],
    telefone: ['', [Validators.required, Validators.minLength(11)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    fotoPerfil: ['', [Validators.required]],
    valorPorKm: ['', [Validators.required]],
    modeloCarro: ['', [Validators.required]],
    placaCarro: ['', [Validators.required, Validators.minLength(7)]],
    corCarro: ['', [Validators.required]],
    fotoCarroExterna: ['', [Validators.required]],
    fotoCarroInterna: ['', [Validators.required]]
  });

  async cadastrar(){
    if(this.formulario.valid){
      const {senha, ...dadosSemSenha} = this.formulario.value;
      await this.authService.criarMotorista(dadosSemSenha as any, senha as string);
      console.log(`Motorista ${dadosSemSenha.nomeCompleto} cadastrado no Firebase.`);
      this.formulario.reset();
    }else{
      console.log('Formulário inválido, verifique os campos.')
    }
  }

  selecionarFoto(event: any, nomeCampo: string){
    const arquivo = event.target.files[0];

    if(arquivo){
      const urlImagem = URL.createObjectURL(arquivo);
      this.formulario.patchValue({[nomeCampo]: urlImagem});
      this.formulario.get(nomeCampo)?.markAsDirty();
      this.formulario.get(nomeCampo)?.markAllAsTouched();
    }
  }
}
