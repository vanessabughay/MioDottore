import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-autocadastro',
  templateUrl: './autocadastro.component.html',
  styleUrls: ['./autocadastro.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  providers: [AuthService]
})
export class AutocadastroComponent implements OnInit {
  form!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cep: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      rua: [{ value: '', disabled: true }],
      numero: [''],
      bairro: [{ value: '', disabled: true }],
      cidade: [{ value: '', disabled: true }],
      uf: [{ value: '', disabled: true }]
    });
  }

  register() {
    if (this.form.invalid) return;

     const { nome, cpf, email, cep } = this.form.getRawValue();

     const dados = { nome, cpf, email, cep };

        this.auth.autocadastroPaciente(dados).subscribe({

      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.error = 'Erro ao criar conta.';
      }
    });
  }

  consultarCep() {
    const cep = this.form.get('cep')?.value;
    if (!cep || cep.length !== 8) {
      this.error = 'CEP inválido';
      return;
    }

    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (dados) => {
        if (dados.erro) {
          this.error = 'CEP não encontrado';
          return;
        }
        this.form.patchValue({
          rua: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          uf: dados.uf
        });
        this.error = '';
      },
      error: () => {
        this.error = 'Erro ao consultar CEP';
      }
    });
  }
}