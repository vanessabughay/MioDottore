import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalConfirmarComparecimento } from './modal-confirmar-comparecimento/modal-confirmar-comparecimento.component';
import { ModalCancelarConsulta } from './modal-cancelar-consulta/modal-cancelar-consulta.component';
import { ModalRealizarConsulta } from './modal-realizar-consulta/modal-realizar-consulta.component';


@Component({
  standalone: true,
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    ModalConfirmarComparecimento,
    ModalCancelarConsulta,
    ModalRealizarConsulta
  ]
})
export class EmployeeDashboardComponent implements OnInit {
  nome = '';
  consultas: any[] = [];
  consultaSelecionada: any = null;
  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    // Nome fictício — pegue de sessão depois
    this.nome = localStorage.getItem('nome') || 'Funcionário';

    // Simulação de consultas
    this.consultas = [
      {
        id: 1,
        dataHora: '10/08/2025 09:00',
        especialidade: 'Cardiologia',
        medico: 'Dr. House',
        paciente: 'Ana Silva',
        codigo: 'AGD123',
        status: 'CHECK-IN'
      },
      {
        id: 2,
        dataHora: '10/08/2025 10:00',
        especialidade: 'Cardiologia',
        medico: 'Dr. House',
        paciente: 'Bruno Costa',
        codigo: 'AGD124',
        status: 'CRIADO'
      },
      {
        id: 3,
        dataHora: '11/08/2025 11:00',
        especialidade: 'Pediatria',
        medico: 'Dra. Grey',
        paciente: 'Carlos Lima',
        codigo: 'AGD125',
        status: 'CHECK-IN'
      }
    ];

    this.consultaSelecionada = {
      especialidade: 'Cardiologia',
      medico: 'Dr. House',
      data: '10/08/2025',
      ocupacao: 'X/Y'
    };
  }

  confirmarPresenca(consulta: any) {
   const ref = this.dialog.open(ModalConfirmarComparecimento, { data: consulta });
    ref.afterClosed().subscribe(result => {
      if (result) {
        alert(`Presença do agendamento ${consulta.id} confirmada.`);
      }
    });
  }

  realizarConsulta() {
    const ref = this.dialog.open(ModalRealizarConsulta, {
      data: this.consultaSelecionada
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        alert('Consulta realizada.');
      }
    });
  }

  cancelarConsulta() {
   const ref = this.dialog.open(ModalCancelarConsulta, {
      data: this.consultaSelecionada
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        alert('Consulta cancelada.');
      }
    });
  }

  cadastrarConsulta() {
    alert('Funcionalidade de cadastro ainda não implementada.');
  }

  gerenciarFuncionarios() {
    alert('Funcionalidade de gerenciamento ainda não implementada.');
  }

  logout() {
    alert('Logout realizado.');
  }
}
