import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-modal-cancelar-consulta',
  templateUrl: './modal-cancelar-consulta.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class ModalCancelarConsulta {
  constructor(
    public dialogRef: MatDialogRef<ModalCancelarConsulta>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}