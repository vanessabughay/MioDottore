import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-autocadastro',
  templateUrl: './autocadastro.component.html',
  styleUrls: ['./autocadastro.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  providers: [AuthService]
})
export class AutocadastroComponent implements OnInit {
  form!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required],
      confirmarSenha: ['', Validators.required],
      tipo_usuario: ['PACIENTE', Validators.required]
    });
  }

  register() {
    if (this.form.invalid) return;

    const { senha, confirmarSenha, ...rest } = this.form.value;

    if (senha !== confirmarSenha) {
      this.error = 'As senhas não coincidem.';
      return;
    }

    const user = { ...rest, senha };

    this.auth.register(user).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Erro ao criar conta.';
      }
    });
  }
}