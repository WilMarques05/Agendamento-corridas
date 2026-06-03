import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroPassageiro } from './cadastro-passageiro';

describe('CadastroPassageiro', () => {
  let component: CadastroPassageiro;
  let fixture: ComponentFixture<CadastroPassageiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroPassageiro],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPassageiro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
