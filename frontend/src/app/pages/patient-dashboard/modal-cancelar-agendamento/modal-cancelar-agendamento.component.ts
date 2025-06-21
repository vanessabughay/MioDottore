import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-cancelar-agendamento',
  templateUrl: './modal-cancelar-agendamento.component.html',
  imports: [CommonModule, MatDialogModule]
})
export class ModalCancelarAgendamento {
  constructor(
    public dialogRef: MatDialogRef<ModalCancelarAgendamento>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}