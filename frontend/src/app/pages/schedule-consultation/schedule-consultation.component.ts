import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConsultationService } from '../../services/consultation.service';
import { PatientServiceService } from '../../services/patient.service.service';
import { ModalConfirmarAgendamento } from './modal-confirmar-agendamento/modal-confirmar-agendamento.component';

@Component({
  standalone: true,
  selector: 'app-schedule-consultation',
  templateUrl: './schedule-consultation.component.html',
  styleUrls: ['./schedule-consultation.component.css'],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class ScheduleConsultationComponent implements OnInit {
  form!: FormGroup;
  consultas: any[] = [];
  saldo = 0;
  cpf = localStorage.getItem('cpf') || '';

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultationService,
    private patientService: PatientServiceService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({ especialidade: [''], medico: [''] });
    this.patientService.getSaldo(this.cpf).subscribe({
      next: res => {
        this.saldo = res.saldoPontos;
        this.loadConsultas();
      },
      error: () => {
        this.saldo = 0;
        this.loadConsultas();
      }
    });
  }

  loadConsultas() {
    const esp = this.form.get('especialidade')?.value || '';
    this.consultaService.buscarDisponiveis(esp).subscribe({
      next: res => {
        const med = this.form.get('medico')?.value?.toLowerCase() || '';
        this.consultas = res.filter((c: any) => c.medicoNome.toLowerCase().includes(med));
      },
      error: () => (this.consultas = [])
    });
  }

  agendar(consulta: any) {
    const ref = this.dialog.open(ModalConfirmarAgendamento, {
      data: {
        especialidade: consulta.especialidadeNome,
        medico: consulta.medicoNome,
        data: consulta.dataHora.split('T')[0],
        hora: consulta.dataHora.split('T')[1].substring(0,5),
        valor: consulta.valor,
        saldo: this.saldo
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        const payload = {
          consultaCodigo: consulta.codigo,
          pacienteCpf: this.cpf,
          pontosParaUsar: Number(result.pontos)
        };
        this.consultaService.agendarConsulta(payload).subscribe(() => this.router.navigate(['/paciente']));
      }
    });
  }

  voltar() {
    this.router.navigate(['/paciente']);
  }
}