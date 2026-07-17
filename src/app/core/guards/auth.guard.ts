import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Autenticacao } from '../../shared/services/autenticacao';

export const authGuard = (perfilEsperado: 'motorista' | 'passageiro'): CanActivateFn => {
  return async () => {
    const authService = inject(Autenticacao);
    const router = inject(Router);

    const usuario = await authService.obterUsuarioAtual();

    // Se não estiver logado, volta pro login
    if (!usuario) {
      router.navigate(['/login']);
      return false;
    }

    // Verifica o perfil no Firestore
    const perfilAtual = await authService.verificarPerfilUsuario(usuario.uid);

    // Se o perfil for o correto, permite a entrada
    if (perfilAtual === perfilEsperado) {
      return true;
    }

    // Caso o usuário tente acessar a rota do outro perfil,
    // ou se o perfil não for encontrado, bloqueia e manda para o login
    router.navigate(['/login']);
    return false;
  };
};
