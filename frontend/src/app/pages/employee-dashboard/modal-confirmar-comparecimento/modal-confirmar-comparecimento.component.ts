import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-confirmar-comparecimento',
  templateUrl: './modal-confirmar-comparecimento.component.html',
  styleUrls: ['./modal-confirmar-comparecimento.component.css'],
  imports: [CommonModule, MatDialogModule]
})
export class ModalConfirmarComparecimento {
  constructor(
    public dialogRef: MatDialogRef<ModalConfirmarComparecimento>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}