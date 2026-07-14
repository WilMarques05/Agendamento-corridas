import { CommonModule } from '@angular/common';
import { Component, inject, Injector, runInInjectionContext } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Autenticacao } from '../../../shared/services/autenticacao';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private autenticacaoService = inject(Autenticacao);
  private router = inject(Router);
  private injector = inject(Injector);

  tipoUsuario: 'passageiro' | 'motorista' = 'passageiro';
  exibirSenha = false;
  carregando = false;
  mensagemErro: string | null = null;

  credenciais = {
    email: '',
    senha: ''
  }

  mudarAba(tipo: 'passageiro' | 'motorista'){
    this.tipoUsuario = tipo;
    this.mensagemErro = null;
  }

  async efetuarLogin(){
    if(!this.credenciais.email || !this.credenciais.senha){
      this.mensagemErro = 'Preencha todos os campos antes de continuar.';
      return;
    }

    this.carregando = true;
    this.mensagemErro = null;

    runInInjectionContext(this.injector, async () => {
      try {
        const resultado = await this.autenticacaoService.fazerLogin(this.credenciais.email, this.credenciais.senha);

        const usuarioRetornado = resultado.tipo === 'motoristas' ? 'motorista' : 'passageiro';

        if(usuarioRetornado !== this.tipoUsuario){
          this.mensagemErro = `Esta conta está registrada como ${usuarioRetornado}. Selecione a aba correta acima.`;
          this.carregando = false;
          return;
        }

        console.log('Login efetuado com sucesso!', resultado.dados);

        if(this.tipoUsuario === 'passageiro'){
          await this.router.navigate(['/painel-passageiro']);
        } else {
          await this.router.navigate(['/painel-motorista']);
        }
      } catch(error: any) {
        console.error('Erro de autenticação no Firebase:', error);

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          this.mensagemErro = 'E-mail ou senha incorretos. Verifique suas credenciais.';
        } else if (error.code === 'auth/too-many-requests') {
          this.mensagemErro = 'Acesso bloqueado temporariamente por excesso de tentativas falhas.';
        } else {
          this.mensagemErro = 'Ocorreu um erro ao tentar realizar o login. Tente novamente mais tarde.';
        }
      } finally {
        this.carregando = false;
      }
    });
  }
}
