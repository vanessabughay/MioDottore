import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  imports: [CommonModule]
})
export class PatientDashboardComponent implements OnInit {
  nome = '';
  pontos = 0;
  filtro = 'futuros';
  agendamentos: any[] = [];

  constructor(private router: Router) {}

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
    alert('Funcionalidade em construção.');
  }

  verHistoricoPontos() {
    alert('Funcionalidade em construção.');
  }
  cancelarAgendamento(id: number) {
    alert(`Agendamento ${id} cancelado.`);
  }

  fazerCheckin(id: number) {
    alert(`Check-in do agendamento ${id} realizado.`);
  }

  logout() {
    alert('Logout realizado.');
  }
}
