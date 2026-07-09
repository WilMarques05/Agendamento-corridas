import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecaoVantagens } from './secao-vantagens';

describe('SecaoVantagens', () => {
  let component: SecaoVantagens;
  let fixture: ComponentFixture<SecaoVantagens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecaoVantagens],
    }).compileComponents();

    fixture = TestBed.createComponent(SecaoVantagens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
