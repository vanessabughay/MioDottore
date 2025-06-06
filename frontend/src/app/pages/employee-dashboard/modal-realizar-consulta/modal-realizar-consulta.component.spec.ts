import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalRealizarConsulta } from './modal-realizar-consulta.component';

describe('ModalRealizarConsulta', () => {
  let component: ModalRealizarConsulta;
  let fixture: ComponentFixture<ModalRealizarConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRealizarConsulta],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRealizarConsulta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});