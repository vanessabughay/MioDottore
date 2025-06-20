import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultationService } from '../../services/consultation.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  standalone: true,
  selector: 'app-create-consultation',
  templateUrl: './create-consultation.component.html',
  styleUrls: ['./create-consultation.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class CreateConsultationComponent implements OnInit {
  form!: FormGroup;
  especialidades = [
    { codigo: 'CARDIO', nome: 'Cardiologia' },
    { codigo: 'DERMA', nome: 'Dermatologia' },
    { codigo: 'NEURO', nome: 'Neurologia' },
    { codigo: 'ORTHO', nome: 'Ortopedia' },
    { codigo: 'PEDIA', nome: 'Pediatria' },
    { codigo: 'GERAL', nome: 'Clínica Geral' }
  ];
  medicos: any[] = [];
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private consultaService: ConsultationService,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      data: ['', Validators.required],
      hora: ['', Validators.required],
      especialidadeCodigo: ['', Validators.required],
      medicoCpf: ['', Validators.required],
      valor: ['', [Validators.required, Validators.min(0.01)]],
      vagas: ['', [Validators.required, Validators.min(1)]]
    });

    this.employeeService.listarFuncionarios().subscribe({
      next: (res) => (this.medicos = res),
      error: () => (this.medicos = [])
    });
  }

  cadastrar() {
    if (this.form.invalid) return;

    const { data, hora, especialidadeCodigo, medicoCpf, valor, vagas } = this.form.value;
    const payload = {
      dataHora: `${data}T${hora}:00`,
      especialidadeCodigo,
      medicoCpf,
      valor: Number(valor),
      vagas: Number(vagas)
    };

    this.consultaService.cadastrarConsulta(payload).subscribe({
      next: () => {
        this.success = 'Consulta cadastrada com sucesso.';
        this.error = '';
        this.form.reset();
      },
      error: () => {
        this.error = 'Erro ao cadastrar consulta.';
        this.success = '';
      }
    });
  }

  voltar() {
    this.router.navigate(['/funcionario']);
  }
}