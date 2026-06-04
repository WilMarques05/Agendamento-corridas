import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CadastroPassageiro } from "./features/autenticacao/cadastro-passageiro/cadastro-passageiro";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CadastroPassageiro],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Agendamento-Corridas');
}
