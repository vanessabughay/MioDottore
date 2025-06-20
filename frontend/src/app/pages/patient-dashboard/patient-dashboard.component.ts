import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultationService } from '../../services/consultation.service';
import { ModalCancelarAgendamento } from './modal-cancelar-agendamento/modal-cancelar-agendamento.component';
import { ModalComprarPontos } from './modal-comprar-pontos/modal-comprar-pontos.component';
import { ModalCheckIn } from './modal-check-in/modal-check-in.component';
import { PatientServiceService } from '../../services/patient.service.service';
import { ModalHistoricoPontos } from './modal-historico-pontos/modal-historico-pontos.component';

@Component({
  standalone: true,
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  imports: [CommonModule, MatDialogModule]
})
export class PatientDashboardComponent implements OnInit {
  nome = '';
  pontos = 0;
  filtro = 'futuros';
  agendamentos: any[] = [];
  cpf = localStorage.getItem('cpf') || '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog,
    private consultaService: ConsultationService,
    private patientService: PatientServiceService
  ) {}

  ngOnInit() {

    this.nome = localStorage.getItem('nome') || 'Paciente';
    this.patientService.getSaldo(this.cpf).subscribe({
      next: res => (this.pontos = res.saldoPontos),
      error: () => (this.pontos = 0)
    });

    this.consultaService.listarAgendamentosPaciente(this.cpf).subscribe({
      next: res => {
        this.agendamentos = res.map((a: any) => ({
          id: a.codigo,
          data: a.consulta.dataHora.split('T')[0],
          especialidade: a.consulta.especialidade.nome,
          medico: a.consulta.medicoNome,
          status: a.status
        }));
      },
      error: () => (this.agendamentos = [])
    });
  }

  agendarConsulta() {
    this.router.navigate(['/paciente/agendar']);
  }

  comprarPontos() {
    const ref = this.dialog.open(ModalComprarPontos);
    ref.afterClosed().subscribe(qtd => {
      if (qtd) {
        this.patientService
          .comprarPontos(this.cpf, Number(qtd))
          .subscribe(res => (this.pontos = res.saldoPontos));
      }
    });
  }

  verHistoricoPontos() {
    this.dialog.open(ModalHistoricoPontos);
  }
  cancelarAgendamento(ag: any) {
    const ref = this.dialog.open(ModalCancelarAgendamento, { data: ag });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultaService.cancelarAgendamento(ag.id, this.cpf).subscribe();
      }
    });
  }

  fazerCheckin(ag: any) {
    const ref = this.dialog.open(ModalCheckIn, { data: ag });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultaService.realizarCheckin(ag.id, this.cpf).subscribe();
      }
    });
  }

  logout() {
    this.auth.logout();
    alert('Logoff realizado com sucesso');
    this.router.navigate(['/login']);
  }
}
