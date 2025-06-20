import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PatientServiceService, TransacaoPontosResponseDTO } from '../../../services/patient.service.service';

@Component({
  standalone: true,
  selector: 'app-modal-historico-pontos',
  templateUrl: './modal-historico-pontos.component.html',
  imports: [CommonModule, MatDialogModule]
})
export class ModalHistoricoPontos implements OnInit {
  transacoes: TransacaoPontosResponseDTO[] = [];
  cpf = localStorage.getItem('cpf') || '';

  constructor(
    private patientService: PatientServiceService,
    public dialogRef: MatDialogRef<ModalHistoricoPontos>
  ) {}

  ngOnInit() {
    if (this.cpf) {
      this.patientService.getTransacoes(this.cpf).subscribe({
        next: res => (this.transacoes = res),
        error: () => (this.transacoes = [])
      });
    }
  }
}