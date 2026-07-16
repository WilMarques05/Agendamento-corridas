import { Component, signal, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { filter } from 'rxjs'; // Removemos o take(1) para monitorar rotas continuamente

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('Agendamento-Corridas');

  // Signal para controlar a exibição do layout
  protected readonly mostrarLayout = signal(true);

  private readonly router = inject(Router);

  ngOnInit(): void {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Monitora mudanças de rota
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        // Define as rotas onde NÃO queremos mostrar Header e Footer
        const rotasSemLayout = ['/painel-passageiro', '/painel-motorista'];
        this.mostrarLayout.set(!rotasSemLayout.includes(event.urlAfterRedirects));

        // Mantém sua lógica de scroll original
        if (window.location.hash) {
          this.router.navigate([], { fragment: undefined, replaceUrl: true });
        }
        window.scrollTo(0, 0);
      });
  }
}

// import { Component, signal, OnInit, inject } from '@angular/core';
// import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
// import { Header } from './shared/components/header/header';
// import { Footer } from './shared/components/footer/footer';
// import { take, filter } from 'rxjs';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, Header, Footer],
//   templateUrl: './app.html',
//   styleUrl: './app.css',
// })
// export class App implements OnInit {
//   protected readonly title = signal('Agendamento-Corridas');

//   private readonly router = inject(Router);

//   ngOnInit(): void {
//     if ('scrollRestoration' in history) {
//       history.scrollRestoration = 'manual';
//     }
//     this.router.events
//       .pipe(
//         filter((event): event is NavigationEnd => event instanceof NavigationEnd),
//         take(1),
//       )
//       .subscribe(() => {
//         if (window.location.hash) {
//           this.router.navigate([], { fragment: undefined, replaceUrl: true });
//         }
//         setTimeout(() => window.scrollTo(0, 0), 10);
//       });
//   }
// }
