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
  agendamentosFiltrados: any[] = [];
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

    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.consultaService.listarAgendamentosPaciente(this.cpf).subscribe({
      next: res => {
        this.agendamentos = res.map((a: any) => ({
          id: a.codigo,
          data: a.dataHora.split('T')[0],
          hora: a.dataHora.split('T')[1],
          dataHora: new Date(a.dataHora),
          especialidade: a.consulta?.especialidade?.nome || 'N/A',
          medico: a.consulta?.medicoNome || 'N/A',
          status: a.status
        }));
        this.aplicarFiltro();
      },
      error: () => {
        this.agendamentos = [];
        this.agendamentosFiltrados = [];
      }
    });
  }

  aplicarFiltro() {
    const agora = new Date();
    

    switch (this.filtro) {
      case 'futuros':
        this.agendamentosFiltrados = this.agendamentos.filter(a => 
          a.dataHora >= agora && 
          (a.status === 'CRIADO' || a.status === 'CHECK_IN' || a.status === 'COMPARECEU')
        );
        break;
      case 'realizados':
        this.agendamentosFiltrados = this.agendamentos.filter(a => 
          a.status === 'REALIZADO'
        );
        break;
      case 'cancelados':
        this.agendamentosFiltrados = this.agendamentos.filter(a => 
          a.status === 'CANCELADO_PACIENTE' || a.status === 'CANCELADO_SISTEMA'
        );
        break;
      default:
        this.agendamentosFiltrados = this.agendamentos;
    }
  }

  alterarFiltro(novoFiltro: string) {
    this.filtro = novoFiltro;
    this.aplicarFiltro();
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
        this.consultaService.cancelarAgendamento(ag.id, this.cpf).subscribe({
          next: () => {
            this.carregarAgendamentos();
            this.patientService.getSaldo(this.cpf).subscribe({
              next: saldo => (this.pontos = saldo.saldoPontos),
              error: err => console.error('Erro ao atualizar saldo:', err)
            });
          },
          error: err => console.error('Erro ao cancelar:', err)
        });
      }
    });
  }

  fazerCheckin(ag: any) {
    const ref = this.dialog.open(ModalCheckIn, { data: ag });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultaService.realizarCheckin(ag.id, this.cpf).subscribe({
          next: () => this.carregarAgendamentos(),
          error: (err) => console.error('Erro ao fazer check-in:', err)
        });
      }
    });
  }

  logout() {
    this.auth.logout();
    alert('Logoff realizado com sucesso');
    this.router.navigate(['/login']);
  }
}
