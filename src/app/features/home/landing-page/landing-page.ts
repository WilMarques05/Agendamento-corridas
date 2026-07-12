import { Component } from '@angular/core';
import { SecaoHero } from './secao-hero/secao-hero';
import { SecaoVantagens } from "./secao-vantagens/secao-vantagens";
import { SecaoComoFunciona } from "./secao-como-funciona/secao-como-funciona";

@Component({
  selector: 'app-landing-page',
  imports: [SecaoHero, SecaoVantagens, SecaoComoFunciona],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
