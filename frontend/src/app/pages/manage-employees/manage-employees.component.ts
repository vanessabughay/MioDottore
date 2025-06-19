import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  standalone: true,
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.component.html',
  styleUrls: ['./manage-employees.component.css'],
  imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective]
})
export class ManageEmployeesComponent implements OnInit {
  funcionarios: any[] = [];
  form!: FormGroup;
  error = '';
  selectedCpf: string | undefined;
  success: string = '';

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.pattern(/^\(\d{2}\) \d{5}-\d{4}$/)]
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

     if (this.selectedCpf) {
      this.employeeService.atualizarFuncionario(this.selectedCpf, this.form.value).subscribe({
        next: () => {
          this.success = 'Funcionário atualizado com sucesso.';
          this.resetForm();
        },
        error: () => this.error = 'Erro ao atualizar funcionário.'
      });
    } else {
      this.employeeService.criarFuncionario(this.form.value).subscribe({
        next: () => {
          this.success = 'Funcionário criado com sucesso.';
          this.resetForm();
        },
        error: () => this.error = 'Erro ao criar funcionário.'
      });
    }
  }

  editarFuncionario(funcionario: any) {
    this.selectedCpf = funcionario.cpf;
    this.form.patchValue({
      nome: funcionario.nome,
      cpf: funcionario.cpf,
      email: funcionario.email,
      telefone: funcionario.telefone
    });
  }

  inativarFuncionario(cpf: string) {
    this.employeeService.inativarFuncionario(cpf).subscribe({
      next: () => {
        this.success = 'Funcionário inativado com sucesso.';
        this.loadFuncionarios();
      },
      error: () => this.error = 'Erro ao inativar funcionário.'
    });
  }

  private resetForm() {
    this.form.reset();
    this.selectedCpf = undefined;
    this.loadFuncionarios();
  }
}