import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-confirmar-agendamento',
  templateUrl: './modal-confirmar-agendamento.component.html',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class ModalConfirmarAgendamento implements OnInit {
  form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalConfirmarAgendamento>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.form = this.fb.group({ pontos: [0, [Validators.min(0)]] });
  }

  get valorComDesconto(): number {
    const pontos = this.form.get('pontos')?.value || 0;
    return Math.max(this.data.valor - pontos * 5, 0);
  }

  confirmar() {
    this.dialogRef.close({ pontos: this.form.get('pontos')?.value });
  }
}