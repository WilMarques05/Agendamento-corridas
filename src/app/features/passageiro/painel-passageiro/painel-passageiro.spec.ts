import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelPassageiro } from './painel-passageiro';

describe('PainelPassageiro', () => {
  let component: PainelPassageiro;
  let fixture: ComponentFixture<PainelPassageiro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelPassageiro],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelPassageiro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
