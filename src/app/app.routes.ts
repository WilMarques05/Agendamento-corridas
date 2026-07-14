import { Routes } from '@angular/router';
import { PainelPassageiro } from './features/passageiro/painel-passageiro/painel-passageiro';
import { PainelMotorista } from './features/motorista/painel-motorista/painel-motorista';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/landing-page/landing-page').then((m) => m.LandingPage),
  },

  {
    path: 'login',
    loadComponent: () => import('./features/autenticacao/login/login').then((m) => m.Login),
  },

  {
    path: 'painel-passageiro',
    component: PainelPassageiro,
  },

  {
    path: 'painel-motorista',
    component: PainelMotorista,
  },

  {
    path: 'cadastro-passageiro',
    loadComponent: () =>
      import('./features/autenticacao/cadastro-passageiro/cadastro-passageiro').then(
        (m) => m.CadastroPassageiro,
      ),
  },

  {
    path: 'cadastro-motorista',
    loadComponent: () =>
      import('./features/autenticacao/cadastro-motorista/cadastro-motorista').then(
        (m) => m.CadastroMotorista,
      ),
  },
];
