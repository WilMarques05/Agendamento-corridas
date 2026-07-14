import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-painel-motorista',
  imports: [CommonModule],
  templateUrl: './painel-motorista.html',
  styleUrl: './painel-motorista.css',
})
export class PainelMotorista {
  online: boolean = false;

  alternarStatus() {
    this.online = !this.online;
  }

  deslogar() {
    //service de autenticação para dar SignOut
  }
}
