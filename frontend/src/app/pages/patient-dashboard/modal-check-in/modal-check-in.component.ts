import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  selector: 'app-modal-check-in',
  templateUrl: './modal-check-in.component.html',
  imports: [CommonModule, MatDialogModule, MatButtonModule]
})
export class ModalCheckIn {
  constructor(
    public dialogRef: MatDialogRef<ModalCheckIn>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}