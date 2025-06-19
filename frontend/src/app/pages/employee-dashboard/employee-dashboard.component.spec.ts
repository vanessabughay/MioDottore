import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDashboardComponent } from './employee-dashboard.component';

import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ModalConfirmarComparecimento } from './modal-confirmar-comparecimento/modal-confirmar-comparecimento.component';
import { ModalCancelarConsulta } from './modal-cancelar-consulta/modal-cancelar-consulta.component';
import { ModalRealizarConsulta } from './modal-realizar-consulta/modal-realizar-consulta.component';
import { ConsultationService } from '../../services/consultation.service';


class MatDialogMock {
  openSpy = jasmine.createSpy('open').and.callFake((_c: any, _d: any) => ({
    afterClosed: () => of(true)
  }));
  open(component: any, config: any) {
    return this.openSpy(component, config);
  }
}

class ConsultationServiceMock {
  confirmarComparecimentoSpy = jasmine.createSpy('confirmarComparecimento').and.returnValue(of({}));
  cancelarConsultaSpy = jasmine.createSpy('cancelarConsulta').and.returnValue(of({}));
  realizarConsultaSpy = jasmine.createSpy('realizarConsulta').and.returnValue(of({}));
  listarProximasSpy = jasmine.createSpy('listarProximas').and.returnValue(of([]));

  confirmarComparecimento(codigo: string) {
    return this.confirmarComparecimentoSpy(codigo);
  }
  cancelarConsulta(codigo: string) {
    return this.cancelarConsultaSpy(codigo);
  }
  realizarConsulta(codigo: string) {
    return this.realizarConsultaSpy(codigo);
  }
  listarProximas() {
    return this.listarProximasSpy();
  }
}

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;
  let dialog: MatDialogMock;
  let consultaSvc: ConsultationServiceMock;
  

  beforeEach(async () => {
    dialog = new MatDialogMock();
    consultaSvc = new ConsultationServiceMock();
    await TestBed.configureTestingModule({
      imports: [EmployeeDashboardComponent],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: ConsultationService, useValue: consultaSvc }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should open modal when confirmarPresenca is called', () => {
    const consulta = component.consultas[0];
    component.confirmarPresenca(consulta);
    expect(dialog.openSpy).toHaveBeenCalledWith(ModalConfirmarComparecimento, { data: consulta });
  });

  it('should call service when modal result is true', () => {
    const consulta = { codigo: 'A1' };
    component.confirmarPresenca(consulta);
    expect(consultaSvc.confirmarComparecimentoSpy).toHaveBeenCalledWith('A1');
  });

  it('should not call service when modal result is false', () => {
    dialog.openSpy.and.callFake((_c: any, _d: any) => ({ afterClosed: () => of(false) }));
    const consulta = { codigo: 'A1' };
    component.confirmarPresenca(consulta);
    expect(consultaSvc.confirmarComparecimentoSpy).not.toHaveBeenCalled();
  });

  
  it('should open modal when cancelarConsulta is called', () => {
    component.cancelarConsulta();
    expect(dialog.openSpy).toHaveBeenCalledWith(ModalCancelarConsulta, {
      data: component.consultaSelecionada
    });
  });

  it('should call cancelarConsulta on service when modal result is true', () => {
    component.cancelarConsulta();
    expect(consultaSvc.cancelarConsultaSpy).toHaveBeenCalled();
  });

  it('should not call cancelarConsulta when modal result is false', () => {
    dialog.openSpy.and.callFake((_c: any, _d: any) => ({ afterClosed: () => of(false) }));
    component.cancelarConsulta();
    expect(consultaSvc.cancelarConsultaSpy).not.toHaveBeenCalled();
  });
  
  it('should open modal when realizarConsulta is called', () => {
    component.realizarConsulta();
    expect(dialog.openSpy).toHaveBeenCalledWith(ModalRealizarConsulta, {
      data: component.consultaSelecionada
    });
  });

 it('should call realizarConsulta on service when modal result is true', () => {
    component.realizarConsulta();
    expect(consultaSvc.realizarConsultaSpy).toHaveBeenCalled();
  });

  it('should not call realizarConsulta when modal result is false', () => {
    dialog.openSpy.and.callFake((_c: any, _d: any) => ({ afterClosed: () => of(false) }));
    component.realizarConsulta();
    expect(consultaSvc.realizarConsultaSpy).not.toHaveBeenCalled();
  });
});
