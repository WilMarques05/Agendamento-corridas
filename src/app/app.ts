import { Component, signal, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CadastroPassageiro } from './features/autenticacao/cadastro-passageiro/cadastro-passageiro';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { take, filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CadastroPassageiro, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('Agendamento-Corridas');

  private readonly router = inject(Router);

  ngOnInit(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        take(1),
      )
      .subscribe(() => {
        if (window.location.hash) {
          this.router.navigate([], { fragment: undefined, replaceUrl: true });
        }
        setTimeout(() => window.scrollTo(0, 0), 10);
      });
  }
}
