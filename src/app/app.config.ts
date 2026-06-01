import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

// importações do Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

const configuracaoFirebase = {
  apiKey: 'AIzaSyDzaxiRAgi7YpN10tCvQXJa4LZiaYTpE1I',
  authDomain: 'agendamento-corridas.firebaseapp.com',
  projectId: 'agendamento-corridas',
  storageBucket: 'agendamento-corridas.firebasestorage.app',
  messagingSenderId: '222557245743',
  appId: '1:222557245743:web:5bc7cfcad268d54fc4d1da',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    //conectando o firebase ao projeto
    provideFirebaseApp(() => initializeApp(configuracaoFirebase)),

    //conectando sistema de Login, Cadastro e Criptografia de senhas
    provideAuth(() => getAuth()),

    //conectando Banco de Dados em tempo real
    provideFirestore(() => getFirestore()),
  ],
};
