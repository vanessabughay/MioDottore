import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalCancelarConsulta } from './modal-cancelar-consulta.component';

describe('ModalCancelarConsulta', () => {
  let component: ModalCancelarConsulta;
  let fixture: ComponentFixture<ModalCancelarConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCancelarConsulta],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCancelarConsulta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});