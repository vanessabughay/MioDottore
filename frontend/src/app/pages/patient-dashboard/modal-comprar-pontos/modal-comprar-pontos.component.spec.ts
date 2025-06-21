import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalComprarPontos } from './modal-comprar-pontos.component';

describe('ModalComprarPontos', () => {
  let component: ModalComprarPontos;
  let fixture: ComponentFixture<ModalComprarPontos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComprarPontos],
      providers: [{ provide: MatDialogRef, useValue: {} }]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComprarPontos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});