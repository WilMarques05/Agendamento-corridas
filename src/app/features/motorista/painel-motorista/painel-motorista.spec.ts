import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelMotorista } from './painel-motorista';

describe('PainelMotorista', () => {
  let component: PainelMotorista;
  let fixture: ComponentFixture<PainelMotorista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelMotorista],
    }).compileComponents();

    fixture = TestBed.createComponent(PainelMotorista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
