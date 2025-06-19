import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalConfirmarComparecimento } from './modal-confirmar-comparecimento/modal-confirmar-comparecimento.component';
import { ModalCancelarConsulta } from './modal-cancelar-consulta/modal-cancelar-consulta.component';
import { ModalRealizarConsulta } from './modal-realizar-consulta/modal-realizar-consulta.component';
import { ConsultationService } from '../../services/consultation.service';

@Component({
  standalone: true,
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css'],
  imports: [
    CommonModule,
    MatDialogModule,
    
  ]
})
export class EmployeeDashboardComponent implements OnInit {
  nome: string = '';
  consultas: any[] = [];
  consultaSelecionada: any = null;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private consultationService: ConsultationService
  ) {}

  ngOnInit(): void {
    // Nome fictício — depois integrar com sistema de login
    this.nome = localStorage.getItem('nome') ?? 'Funcionário';

    this.loadConsultas();

    // Apenas para teste; remova em produção
    this.consultaSelecionada = {
      codigo: 'CONSULTA123',
      especialidade: 'Cardiologia',
      medico: 'Dr. House',
      data: '10/08/2025',
      ocupacao: 'X/Y'
    };
  }

  loadConsultas(): void {
    this.consultationService.listarProximas().subscribe({
      next: (res) => (this.consultas = res),
      error: () => (this.consultas = [])
    });
  }

  confirmarPresenca(consulta: any): void {
    const ref = this.dialog.open(ModalConfirmarComparecimento, { data: consulta });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService
          .confirmarComparecimento(consulta.codigo)
          .subscribe(() => this.loadConsultas());
      }
    });
  }

  realizarConsulta(): void {
    const ref = this.dialog.open(ModalRealizarConsulta, {
      data: this.consultaSelecionada
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService
          .realizarConsulta(this.consultaSelecionada.codigo)
          .subscribe(() => this.loadConsultas());
      }
    });
  }

  cancelarConsulta(): void {
    const ref = this.dialog.open(ModalCancelarConsulta, {
      data: this.consultaSelecionada
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService
          .cancelarConsulta(this.consultaSelecionada.codigo)
          .subscribe(() => this.loadConsultas());
      }
    });
  }

  cadastrarConsulta(): void {
    alert('Funcionalidade de cadastro ainda não implementada.');
  }

  gerenciarFuncionarios(): void {
    this.router.navigate(['/funcionario/gerenciar']);
  }

  logout(): void {
    alert('Logout realizado.');
  }
}
