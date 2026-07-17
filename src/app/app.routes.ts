import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // Certifique-se do caminho correto

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
    loadComponent: () =>
      import('./features/passageiro/painel-passageiro/painel-passageiro').then(
        (m) => m.PainelPassageiro,
      ),
    canActivate: [authGuard('passageiro')], // Proteção para Passageiro
  },
  {
    path: 'painel-motorista',
    loadComponent: () =>
      import('./features/motorista/painel-motorista/painel-motorista').then(
        (m) => m.PainelMotorista,
      ),
    canActivate: [authGuard('motorista')], // Proteção para Motorista
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
