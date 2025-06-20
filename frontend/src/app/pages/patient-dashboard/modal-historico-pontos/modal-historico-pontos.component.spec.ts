import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PatientServiceService } from '../../../services/patient.service.service';
import { ModalHistoricoPontos } from './modal-historico-pontos.component';

describe('ModalHistoricoPontos', () => {
  let component: ModalHistoricoPontos;
  let fixture: ComponentFixture<ModalHistoricoPontos>;

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientServiceService', ['getTransacoes']);
    patientServiceSpy.getTransacoes.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ModalHistoricoPontos],
      providers: [
        { provide: PatientServiceService, useValue: patientServiceSpy },
        { provide: MatDialogRef, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalHistoricoPontos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});