import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
  consultasDisponiveis: any[] = [];
  consultaSelecionada: any = null;
  value: number = 0.0;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private consultationService: ConsultationService,
    private auth: AuthService
  ) {}


  ngOnInit(): void {
    // Nome fictício — depois integrar com sistema de login
    this.nome = localStorage.getItem('nome') ?? 'Funcionário';

    this.loadConsultas();

    this.loadConsultasDisponiveis();
  }

  loadConsultas(): void {
    this.consultationService.listarProximas().subscribe({
      next: (res) => (this.consultas = res),
      error: () => (this.consultas = [])
    });
  }


loadConsultasDisponiveis(): void {
    this.consultationService.listarDisponiveis().subscribe({
      next: (res) => (this.consultasDisponiveis = res),
      error: () => (this.consultasDisponiveis = [])
    });
  }

  selecionarConsulta(codigo: string): void {
    this.consultaSelecionada = this.consultasDisponiveis.find(c => c.codigo === codigo);
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
    this.router.navigate(['/funcionario/cadastrar-consulta']);
  }

  gerenciarFuncionarios(): void {
    this.router.navigate(['/funcionario/gerenciar']);
  }

  logout(): void {
    this.auth.logout();
    alert('Logoff realizado com sucesso');
    this.router.navigate(['/login']);
  }

  onSelectChange(event: Event): void {
  const target = event.target as HTMLSelectElement;
  const codigoSelecionado = target.value;
  this.selecionarConsulta(codigoSelecionado);
}

}
