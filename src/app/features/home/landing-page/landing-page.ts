import { Component } from '@angular/core';
import { SecaoHero } from './secao-hero/secao-hero';
import { SecaoVantagens } from "./secao-vantagens/secao-vantagens";

@Component({
  selector: 'app-landing-page',
  imports: [SecaoHero, SecaoVantagens],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
