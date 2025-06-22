import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-modal-senha-gerada',
  templateUrl: './modal-senha-gerada.component.html',
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class ModalSenhaGerada {
  constructor(
    public dialogRef: MatDialogRef<ModalSenhaGerada>,
    @Inject(MAT_DIALOG_DATA) public data: { senha: string }
  ) {}
}