import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./features/home/landing-page/landing-page').then(m => m.LandingPage)
  },

  {
    path: 'login',
    loadComponent: () => import('./features/autenticacao/login/login').then(m => m.Login)
  },

  {
    path: 'cadastro-passageiro',
    loadComponent: () => import('./features/autenticacao/cadastro-passageiro/cadastro-passageiro').then(m => m.CadastroPassageiro)
  },

  {
    path: 'cadastro-motorista',
    loadComponent: () => import('./features/autenticacao/cadastro-motorista/cadastro-motorista').then(m => m.CadastroMotorista)
  }
];
