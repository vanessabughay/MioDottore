import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ConsultationService } from '../../services/consultation.service';
import { PatientServiceService } from '../../services/patient.service.service';
import { PatientDashboardComponent } from './patient-dashboard.component';

describe('PatientDashboardComponent', () => {
  let component: PatientDashboardComponent;
  let fixture: ComponentFixture<PatientDashboardComponent>;

  beforeEach(async () => {
    const consultaServiceSpy = jasmine.createSpyObj('ConsultationService', ['listarAgendamentosPaciente']);
    consultaServiceSpy.listarAgendamentosPaciente.and.returnValue(of([]));
    const patientServiceSpy = jasmine.createSpyObj('PatientServiceService', ['getSaldo']);
    patientServiceSpy.getSaldo.and.returnValue(of({ saldoPontos: 0 }));
    await TestBed.configureTestingModule({
      imports: [PatientDashboardComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ConsultationService, useValue: consultaServiceSpy },
        { provide: PatientServiceService, useValue: patientServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
