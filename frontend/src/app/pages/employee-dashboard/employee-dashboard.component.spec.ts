import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDashboardComponent } from './employee-dashboard.component';

import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ModalConfirmarComparecimento } from './modal-confirmar-comparecimento/modal-confirmar-comparecimento.component';
import { ModalCancelarConsulta } from './modal-cancelar-consulta/modal-cancelar-consulta.component';

class MatDialogMock {
  openSpy = jasmine.createSpy('open').and.callFake((_c: any, _d: any) => ({
    afterClosed: () => of(true)
  }));
  open(component: any, config: any) {
    return this.openSpy(component, config);
  }
}

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;
  let dialog: MatDialogMock;

  beforeEach(async () => {
    dialog = new MatDialogMock();
    await TestBed.configureTestingModule({
      imports: [EmployeeDashboardComponent],
      providers: [{ provide: MatDialog, useValue: dialog }]
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

  it('should alert when modal result is true', () => {
    spyOn(window, 'alert');
    const consulta = component.consultas[0];
    component.confirmarPresenca(consulta);
    expect(window.alert).toHaveBeenCalledWith(`Presença do agendamento ${consulta.id} confirmada.`);
  });

  it('should not alert when modal result is false', () => {
    dialog.openSpy.and.callFake((_c: any, _d: any) => ({ afterClosed: () => of(false) }));
    spyOn(window, 'alert');
    const consulta = component.consultas[0];
    component.confirmarPresenca(consulta);
    expect(window.alert).not.toHaveBeenCalled();
  });

  
  it('should open modal when cancelarConsulta is called', () => {
    component.cancelarConsulta();
    expect(dialog.openSpy).toHaveBeenCalledWith(ModalCancelarConsulta, {
      data: component.consultaSelecionada
    });
  });

  it('should alert when cancelarConsulta modal result is true', () => {
    spyOn(window, 'alert');
    component.cancelarConsulta();
    expect(window.alert).toHaveBeenCalledWith('Consulta cancelada.');
  });

  it('should not alert when cancelarConsulta modal result is false', () => {
    dialog.openSpy.and.callFake((_c: any, _d: any) => ({ afterClosed: () => of(false) }));
    spyOn(window, 'alert');
    component.cancelarConsulta();
    expect(window.alert).not.toHaveBeenCalled();
  });
  
});
