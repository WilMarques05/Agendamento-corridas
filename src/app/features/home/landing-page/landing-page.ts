import { Component } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { Carrossel } from '../carrossel/carrossel';

@Component({
  selector: 'app-landing-page',
  imports: [Header, Carrossel],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
