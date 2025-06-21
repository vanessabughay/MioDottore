import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalConfirmarAgendamento } from './modal-confirmar-agendamento.component';

describe('ModalConfirmarAgendamento', () => {
  let component: ModalConfirmarAgendamento;
  let fixture: ComponentFixture<ModalConfirmarAgendamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalConfirmarAgendamento],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalConfirmarAgendamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});