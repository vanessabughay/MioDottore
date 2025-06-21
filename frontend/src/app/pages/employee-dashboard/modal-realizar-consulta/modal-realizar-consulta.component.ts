import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-realizar-consulta',
  templateUrl: './modal-realizar-consulta.component.html',
  styleUrls: ['./modal-realizar-consulta.component.css'],
  imports: [CommonModule, MatDialogModule]
})
export class ModalRealizarConsulta {
  constructor(
    public dialogRef: MatDialogRef<ModalRealizarConsulta>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}