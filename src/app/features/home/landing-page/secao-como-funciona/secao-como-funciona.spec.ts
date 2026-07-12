import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecaoComoFunciona } from './secao-como-funciona';

describe('SecaoComoFunciona', () => {
  let component: SecaoComoFunciona;
  let fixture: ComponentFixture<SecaoComoFunciona>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecaoComoFunciona],
    }).compileComponents();

    fixture = TestBed.createComponent(SecaoComoFunciona);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
