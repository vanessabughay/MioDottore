import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css'],
  imports: [CommonModule]
})
export class EmployeeDashboardComponent implements OnInit {
  nome = '';
  consultas: any[] = [];

  ngOnInit() {
    // Nome fictício — pegue de sessão depois
    this.nome = localStorage.getItem('nome') || 'Funcionário';

    // Simulação de consultas
    this.consultas = [
      { id: 1, paciente: 'João Silva', horario: '09:00', status: 'AGENDADA' },
      { id: 2, paciente: 'Maria Souza', horario: '10:00', status: 'AGENDADA' },
      { id: 3, paciente: 'Carlos Lima', horario: '11:00', status: 'AGENDADA' }
    ];
  }

  confirmar(id: number) {
    alert(`Consulta ${id} confirmada.`);
  }

  realizar(id: number) {
    alert(`Consulta ${id} realizada.`);
  }

  cancelar(id: number) {
    alert(`Consulta ${id} cancelada.`);
  }
}
