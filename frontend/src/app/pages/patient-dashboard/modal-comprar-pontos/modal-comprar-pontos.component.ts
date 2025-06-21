import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-modal-comprar-pontos',
  templateUrl: './modal-comprar-pontos.component.html',
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class ModalComprarPontos implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<ModalComprarPontos>) {}

  ngOnInit() {
    this.form = this.fb.group({ quantidade: [0, [Validators.required, Validators.min(1)]] });
  }

  get valorTotal(): number {
    const qtd = this.form.get('quantidade')?.value || 0;
    return qtd * 5;
  }

  confirmar() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value.quantidade);
  }
}