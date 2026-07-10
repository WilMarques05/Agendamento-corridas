import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsVantagens } from './cards-vantagens';

describe('CardsVantagens', () => {
  let component: CardsVantagens;
  let fixture: ComponentFixture<CardsVantagens>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsVantagens],
    }).compileComponents();

    fixture = TestBed.createComponent(CardsVantagens);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
