import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'cadastro-passageiro',
    loadComponent: () => import('./features/autenticacao/cadastro-passageiro/cadastro-passageiro').then(m => m.CadastroPassageiro)
  },

  {
    path: 'cadastro-motorista',
    loadComponent: () => import('./features/autenticacao/cadastro-motorista/cadastro-motorista').then(m => m.CadastroMotorista)
  }
];
