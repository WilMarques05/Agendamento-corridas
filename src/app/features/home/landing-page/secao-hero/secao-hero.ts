import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-secao-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './secao-hero.html',
  styleUrl: './secao-hero.css',
})
export class SecaoHero {}
