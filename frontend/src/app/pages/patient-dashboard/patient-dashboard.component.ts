import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultationService } from '../../services/consultation.service';
import { ModalCancelarAgendamento } from './modal-cancelar-agendamento/modal-cancelar-agendamento.component';
import { ModalComprarPontos } from './modal-comprar-pontos/modal-comprar-pontos.component';
import { ModalCheckIn } from './modal-check-in/modal-check-in.component';

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
    private consultaService: ConsultationService
  ) {}

  ngOnInit() {
  // Dados simulados
    this.nome = localStorage.getItem('nome') || 'Paciente';
    this.pontos = Number(localStorage.getItem('pontos')) || 0;

    this.agendamentos = [
      {
        id: 1,
        data: '10/08/2025',
        especialidade: 'Cardiologia',
        medico: 'Dr. House',
        status: 'CRIADO'
      },
      {
        id: 2,
        data: '05/07/2025',
        especialidade: 'Pediatria',
        medico: 'Dra. Grey',
        status: 'REALIZADO'
      },
      {
        id: 3,
        data: '01/06/2025',
        especialidade: 'Dermatologia',
        medico: 'Dr. Who',
        status: 'CANCELADO'
      }
    ];
  }

  agendarConsulta() {
    this.router.navigate(['/paciente/agendar']);
  }

  comprarPontos() {
    const ref = this.dialog.open(ModalComprarPontos);
    ref.afterClosed().subscribe(qtd => {
      if (qtd) {
        this.pontos += Number(qtd);
      }
    });
  }

  verHistoricoPontos() {
    alert('Funcionalidade em construção.');
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
