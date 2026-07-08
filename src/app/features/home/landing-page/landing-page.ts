import { Component } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { Carrossel } from '../carrossel/carrossel';
import { Footer } from "../../../shared/components/footer/footer";

@Component({
  selector: 'app-landing-page',
  imports: [Header, Carrossel, Footer],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}
