import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalConfirmarComparecimento } from './modal-confirmar-comparecimento.component';

describe('ModalConfirmarComparecimento', () => {
  let component: ModalConfirmarComparecimento;
  let fixture: ComponentFixture<ModalConfirmarComparecimento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfirmarComparecimento],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConfirmarComparecimento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});