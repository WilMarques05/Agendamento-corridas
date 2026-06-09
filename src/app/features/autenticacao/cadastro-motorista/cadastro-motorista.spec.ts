import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroMotorista } from './cadastro-motorista';

describe('CadastroMotorista', () => {
  let component: CadastroMotorista;
  let fixture: ComponentFixture<CadastroMotorista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroMotorista],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroMotorista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
