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

  constructor(private router: Router) {}

  ngOnInit() {
    // Dados simulados — depois você pode substituir por chamada ao backend
    this.nome = localStorage.getItem('nome') || 'Paciente';
    this.pontos = Number(localStorage.getItem('pontos')) || 0;
  }

  agendarConsulta() {
    this.router.navigate(['/paciente/agendar']);
  }

  verConsultas() {
    this.router.navigate(['/paciente/agendamentos']);
  }

  comprarPontos() {
    alert('Funcionalidade em construção.');
  }
}
