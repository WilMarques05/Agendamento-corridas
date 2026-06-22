import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CadastroPassageiro } from "./features/autenticacao/cadastro-passageiro/cadastro-passageiro";
import { Header } from "./shared/components/header/header";
import { Footer } from "./shared/components/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CadastroPassageiro, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Agendamento-Corridas');
}
