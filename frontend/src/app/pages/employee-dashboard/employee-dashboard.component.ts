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
  agendamentos: any[] = [];
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
    this.nome = localStorage.getItem('nome') ?? 'Funcionário';
    this.loadConsultas();
    this.loadAgendamentos();
    this.loadConsultasDisponiveis();
  }

  loadConsultas(): void {
    this.consultationService.listarProximas().subscribe({
      next: (res) => (this.consultas = res),
      error: () => (this.consultas = [])
    });
  }

  loadAgendamentos(): void {
    this.consultationService.listarAgendamentosProximas48h().subscribe({
      next: (res) => {
        this.agendamentos = res.map((a: any) => ({
          codigo: a.codigo,
          dataHora: a.dataHora,
          especialidade: a.consulta?.especialidade?.nome || 'N/A',
          medico: a.consulta?.medicoNome || 'N/A',
          paciente: a.pacienteNome || 'N/A',
          status: a.status,
          consultaCodigo: a.consulta?.codigo
        }));
      },
      error: () => (this.agendamentos = [])
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

  confirmarPresenca(agendamento: any): void {
    const ref = this.dialog.open(ModalConfirmarComparecimento, { data: agendamento });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService
          .confirmarComparecimento(agendamento.codigo)
          .subscribe(() => {
            this.loadConsultas();
            this.loadAgendamentos();
          });
      }
    });
  }

  cancelarAgendamento(agendamento: any): void {
    const confirmacao = confirm(`Tem certeza que deseja cancelar o agendamento ${agendamento.codigo}?`);
    if (confirmacao) {
      this.consultationService
        .cancelarConsulta(agendamento.consultaCodigo)
        .subscribe({
          next: () => {
            alert('Agendamento cancelado com sucesso!');
            this.loadConsultas();
            this.loadAgendamentos();
            this.loadConsultasDisponiveis();
          },
          error: (err) => {
            alert('Erro ao cancelar agendamento: ' + (err.error?.erro || err.message));
          }
        });
    }
  }

  realizarConsulta(): void {
    const ref = this.dialog.open(ModalRealizarConsulta, {
      data: this.consultaSelecionada
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService
          .realizarConsulta(this.consultaSelecionada.codigo)
          .subscribe(() => {
            this.loadConsultas();
            this.loadAgendamentos();
          });
      }
    });
  }

  cancelarConsulta(): void {
    if (!this.podeCancelarConsulta()) {
      alert('Não é possível cancelar consultas com mais de 50% das vagas ocupadas.');
      return;
    }
    const ref = this.dialog.open(ModalCancelarConsulta, {
      data: this.consultaSelecionada,
      panelClass: 'modal'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService
          .cancelarConsulta(this.consultaSelecionada.codigo)
          .subscribe(() => {
            this.loadConsultas();
            this.loadAgendamentos();
            this.loadConsultasDisponiveis();
            this.consultaSelecionada = null;
          });
      }
    });
  }
    
 podeCancelarConsulta(): boolean {
    if (!this.consultaSelecionada) {
      return false;
    }
    const ocupadas = this.consultaSelecionada.vagas - this.consultaSelecionada.vagasDisponiveis;
    const total = this.consultaSelecionada.vagas || 1;
    return ocupadas / total <= 0.5;
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
