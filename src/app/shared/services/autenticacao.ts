import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Passageiro } from '../models/passageiro.model';
import { Motorista } from '../models/motorista.model';
import { onAuthStateChanged, User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class Autenticacao {
  private autenticacao = inject(Auth);
  private firestore = inject(Firestore);

  async criarPassageiro(dados: Passageiro, senha: string): Promise<void> {
    const credencial = await createUserWithEmailAndPassword(this.autenticacao, dados.email, senha);

    const documentoReferencia = doc(this.firestore, 'passageiros', credencial.user.uid);
    await setDoc(documentoReferencia, dados);
  }

  async criarMotorista(dados: Motorista, senha: string): Promise<void> {
    const credencial = await createUserWithEmailAndPassword(this.autenticacao, dados.email, senha);

    const documentoReferencia = doc(this.firestore, 'motoristas', credencial.user.uid);
    await setDoc(documentoReferencia, dados);
  }

  async fazerLogin(email: string, senha: string): Promise<{ dados: any; tipo: 'motoristas' | 'passageiros' }> {
    const credencial = await signInWithEmailAndPassword(this.autenticacao, email, senha);
    const motoristaReferencia = doc(this.firestore, 'motoristas', credencial.user.uid);
    const buscaMotorista = await getDoc(motoristaReferencia);

    if (buscaMotorista.exists()) {
      return {
        dados: buscaMotorista.data(),
        tipo: 'motoristas',
      };
    }

    const passageiroReferencia = doc(this.firestore, 'passageiros', credencial.user.uid);
    const buscaPassageiro = await getDoc(passageiroReferencia);
    return {
      dados: buscaPassageiro.data(),
      tipo: 'passageiros',
    };
  }

  async obterUsuarioAtual(): Promise<User | null> {
  return new Promise((resolve) => {
    onAuthStateChanged(this.autenticacao, (user) => {
      resolve(user);
    });
  });
}

async verificarPerfilUsuario(uid: string): Promise<'motorista' | 'passageiro' | null> {
  const motoristaRef = doc(this.firestore, 'motoristas', uid);
  const buscaMotorista = await getDoc(motoristaRef);

  if (buscaMotorista.exists()) {
    return 'motorista';
  }

  const passageiroRef = doc(this.firestore, 'passageiros', uid);
  const buscaPassageiro = await getDoc(passageiroRef);

  if (buscaPassageiro.exists()) {
    return 'passageiro';
  }

  return null;
}

}
