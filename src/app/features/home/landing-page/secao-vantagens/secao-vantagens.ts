import { Component } from '@angular/core';
import { Carrossel } from "./components/carrossel/carrossel";
import { CardsVantagens } from "./components/cards-vantagens/cards-vantagens";

@Component({
  selector: 'app-secao-vantagens',
  imports: [Carrossel, CardsVantagens],
  templateUrl: './secao-vantagens.html',
  styleUrl: './secao-vantagens.css',
})
export class SecaoVantagens {}
