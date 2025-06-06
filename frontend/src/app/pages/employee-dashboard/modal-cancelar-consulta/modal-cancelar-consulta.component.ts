import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-cancelar-consulta',
  templateUrl: './modal-cancelar-consulta.component.html',
  styleUrls: ['./modal-cancelar-consulta.component.css'],
  imports: [CommonModule, MatDialogModule]
})
export class ModalCancelarConsulta {
  constructor(
    public dialogRef: MatDialogRef<ModalCancelarConsulta>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}