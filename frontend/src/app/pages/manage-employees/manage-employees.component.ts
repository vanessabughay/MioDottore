import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalSenhaGerada } from '../../components/modal-senha-gerada/modal-senha-gerada.component';


@Component({
  standalone: true,
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.component.html',
  styleUrls: ['./manage-employees.component.css'],
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule]
})
export class ManageEmployeesComponent implements OnInit {
  funcionarios: any[] = [];
  form!: FormGroup;
  error = '';
  selectedId: number | undefined;
  success: string = '';

   get invalidFields(): string[] {
    const fields: string[] = [];
    const controls = this.form.controls;
    if (controls['nome']?.invalid) fields.push('Nome');
    if (controls['cpf']?.invalid) fields.push('CPF');
    if (controls['email']?.invalid) fields.push('E-mail');
    if (controls['telefone']?.invalid) fields.push('Telefone');
    return fields;
  }

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.pattern(/^\d{11}$/)]
    });
    this.loadFuncionarios();
  }

  loadFuncionarios() {
    this.employeeService.listarFuncionarios().subscribe({
      next: (res) => this.funcionarios = res,
      error: () => this.error = 'Erro ao listar funcionários.'
    });
  }

  criarFuncionario() {
    if (this.form.invalid) return;

    

     const { nome, cpf, email, telefone } = this.form.value;
    const payload = {
      nome,
      cpf: cpf.replace(/\D/g, ''),
      email,
      telefone: telefone ? telefone.replace(/\D/g, '') : ''
    };

     if (this.selectedId) {
      this.employeeService.atualizarFuncionario(this.selectedId, payload).subscribe({
        next: () => {
          this.success = 'Funcionário atualizado com sucesso.';
          this.resetForm();
        },
        error: () => this.error = 'Erro ao atualizar funcionário.'
      });
    } else {
      this.employeeService.criarFuncionario(payload).subscribe({
        next: (res) => {
          if (res?.senhaGerada) {
            this.dialog.open(ModalSenhaGerada, { data: { senha: res.senhaGerada } });
          }
          this.success = 'Funcionário criado com sucesso.';
          this.resetForm();
        },
        error: () => this.error = 'Erro ao criar funcionário.'
      });
    }
  }

  editarFuncionario(funcionario: any) {
    this.selectedId = funcionario.id;
    this.form.patchValue({
      nome: funcionario.nome,
      cpf: funcionario.cpf,
      email: funcionario.email,
      telefone: funcionario.telefone
    });
  }

  inativarFuncionario(funcionario: any) {
    const confirmacao = confirm(`Tem certeza que deseja inativar o funcionário ${funcionario.nome}?`);
    if (confirmacao) {
      this.employeeService.inativarFuncionario(funcionario.id).subscribe({
        next: () => {
          this.success = `Funcionário ${funcionario.nome} inativado com sucesso.`;
          this.error = '';
          this.loadFuncionarios();
        },
        error: () => {
          this.error = `Erro ao inativar funcionário ${funcionario.nome}.`;
          this.success = '';
        }
      });
    }
  }

  private resetForm() {
    this.form.reset();
    this.selectedId = undefined;
    this.loadFuncionarios();
  }

   voltar() {
    this.router.navigate(['/funcionario']);
  }
}