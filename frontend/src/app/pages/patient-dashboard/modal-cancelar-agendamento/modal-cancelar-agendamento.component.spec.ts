import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalCancelarAgendamento } from './modal-cancelar-agendamento.component';

describe('ModalCancelarAgendamento', () => {
  let component: ModalCancelarAgendamento;
  let fixture: ComponentFixture<ModalCancelarAgendamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCancelarAgendamento],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCancelarAgendamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});