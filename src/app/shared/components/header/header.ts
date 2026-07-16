import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private router = inject(Router);
  protected isDashboard: boolean = false;

  // Dados simulados para o usuário logado (substitua pela sua lógica real de Auth)
  protected nomeUsuario: string = 'Tatiane';
  protected fotoUsuario: string = 'assets/foto-perfil.jpg';

  ngOnInit() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isDashboard = event.urlAfterRedirects.includes('/painel-');
      });
  }

  logout() {
    // Implemente sua lógica de signOut aqui
    this.router.navigate(['/']);
  }
}
