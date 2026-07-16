import { ThemeService } from './../../services/theme';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private router = inject(Router);
  private themeService = inject(ThemeService);
  protected isDashboard: boolean = false;

  protected nomeUsuario: string = '';
  protected fotoUsuario: string = '';

  ngOnInit() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isDashboard = event.urlAfterRedirects.includes('/painel-');
      });
  }

  toggleTheme() {
  this.themeService.toggleTheme();
}

  logout() {
    this.router.navigate(['/']);
  }
}
