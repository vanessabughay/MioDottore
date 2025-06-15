import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: true,
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.component.html',
  styleUrls: ['./manage-employees.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ManageEmployeesComponent implements OnInit {
  funcionarios: any[] = [];
  form!: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private employeeService: EmployeeService) {}

  ngOnInit() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['']
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

    this.employeeService.criarFuncionario(this.form.value).subscribe({
      next: () => {
        this.form.reset();
        this.loadFuncionarios();
      },
      error: () => this.error = 'Erro ao criar funcionário.'
    });
  }
}