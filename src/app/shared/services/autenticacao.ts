import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class Autenticacao {
  private autenticacao = inject(Auth);
  private firestore = inject(Firestore);
}
