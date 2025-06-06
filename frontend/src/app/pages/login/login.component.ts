import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]]
    });
  }

  login() {
    if (this.form.invalid) return;

    const { email, senha } = this.form.value;

    this.auth.login(email!, senha!).subscribe({
      next: () => {
        const tipo = this.auth.getTipoUsuario();
        if (tipo === 'PACIENTE') {
          this.router.navigate(['/paciente']);
        } else if (tipo === 'FUNCIONARIO') {
          this.router.navigate(['/funcionario']);
        } else {
          this.error = 'Tipo de usuário desconhecido.';
        }
      },
      error: () => {
        this.error = 'E-mail ou senha inválidos.';
      }
    });
  }
}
