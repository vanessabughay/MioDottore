##  **Mudanças no FRONTEND**

### **1. Service: `consultation.service.ts`**

#### ** Novos Métodos Adicionados:**
```typescript
// ADICIONADO: Buscar agendamentos das próximas 48h para funcionários
listarAgendamentosProximas48h(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/agendamentos/proximas48h`, {
    headers: this.getAuthHeaders()
  });
}

// ADICIONADO: Buscar agendamentos do paciente das próximas 48h
listarAgendamentosPacienteProximas48h(cpf: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/agendamentos/paciente/${cpf}/proximas48h`, {
    headers: this.getAuthHeaders()
  });
}
```

### **2. Patient Dashboard: `patient-dashboard.component.ts`**

#### **Estrutura de Dados Melhorada:**
```typescript
export class PatientDashboardComponent implements OnInit {
  // ADICIONADO: Array para agendamentos filtrados
  agendamentosFiltrados: any[] = [];
  
  // NOVO MÉTODO: Carregamento otimizado
  carregarAgendamentos() {
    this.consultaService.listarAgendamentosPaciente(this.cpf).subscribe({
      next: res => {
        this.agendamentos = res.map((a: any) => ({
          id: a.codigo,
          data: a.dataHora.split('T')[0], // CORRIGIDO: usa a.dataHora
          hora: a.dataHora.split('T')[1],
          dataHora: new Date(a.dataHora),
          especialidade: a.consulta?.especialidade?.nome || 'N/A', // CORRIGIDO: tratamento de null
          medico: a.consulta?.medicoNome || 'N/A',
          status: a.status
        }));
        this.aplicarFiltro(); // NOVO: aplica filtro automaticamente
      },
      error: () => {
        this.agendamentos = [];
        this.agendamentosFiltrados = [];
      }
    });
  }

  // NOVO MÉTODO: Sistema de filtros funcionais
  aplicarFiltro() {
    const agora = new Date();
    
    switch (this.filtro) {
      case 'futuros':
        this.agendamentosFiltrados = this.agendamentos.filter(a => 
          a.dataHora >= agora && 
          (a.status === 'CRIADO' || a.status === 'CHECK_IN' || a.status === 'COMPARECEU')
        );
        break;
      case 'realizados':
        this.agendamentosFiltrados = this.agendamentos.filter(a => 
          a.status === 'REALIZADO'
        );
        break;
      case 'cancelados':
        this.agendamentosFiltrados = this.agendamentos.filter(a => 
          a.status === 'CANCELADO_PACIENTE' || a.status === 'CANCELADO_SISTEMA'
        );
        break;
      default:
        this.agendamentosFiltrados = this.agendamentos;
    }
  }

  // NOVO MÉTODO: Alteração de filtro
  alterarFiltro(novoFiltro: string) {
    this.filtro = novoFiltro;
    this.aplicarFiltro();
  }
}
```

#### ** Atualização de Callbacks:**
```typescript
// ANTES: Não recarregava após ações
// DEPOIS: Recarrega dados após cancelamento e check-in
cancelarAgendamento(ag: any) {
  const ref = this.dialog.open(ModalCancelarAgendamento, { data: ag });
  ref.afterClosed().subscribe(result => {
    if (result) {
      this.consultaService.cancelarAgendamento(ag.id, this.cpf).subscribe({
        next: () => this.carregarAgendamentos(), // ADICIONADO
        error: (err) => console.error('Erro ao cancelar:', err)
      });
    }
  });
}
```

### **3. Patient Dashboard: `patient-dashboard.component.html`**

#### **  Filtros Funcionais:**
```html
<!-- ANTES: Filtros não funcionavam -->
<button (click)="filtro = 'futuros'" [class.active]="filtro === 'futuros'">

<!-- DEPOIS: Filtros funcionais -->
<button (click)="alterarFiltro('futuros')" [class.active]="filtro === 'futuros'">
```

#### ** Tabela Otimizada:**
```html
<!-- ANTES: Mostrava array completo -->
<tr *ngFor="let a of agendamentos">

<!-- DEPOIS: Mostra apenas filtrados + mensagem quando vazio -->
<tr *ngFor="let a of agendamentosFiltrados">
  <!-- ... dados aqui ... -->
</tr>
<tr *ngIf="agendamentosFiltrados.length === 0">
  <td colspan="5" style="text-align: center; padding: 20px;">
    Nenhum agendamento encontrado para este filtro.
  </td>
</tr>
```

### **4. Employee Dashboard: `employee-dashboard.component.ts`**

#### **Nova Funcionalidade - Agendamentos:**
```typescript
export class EmployeeDashboardComponent implements OnInit {
  // ADICIONADO: Array para agendamentos
  agendamentos: any[] = [];

  ngOnInit(): void {
    this.nome = localStorage.getItem('nome') ?? 'Funcionário';
    this.loadConsultas();
    this.loadAgendamentos(); // NOVO
    this.loadConsultasDisponiveis();
  }

  // NOVO MÉTODO: Carrega agendamentos das próximas 48h
  loadAgendamentos(): void {
    this.consultationService.listarAgendamentosProximas48h().subscribe({
      next: (res) => {
        this.agendamentos = res.map((a: any) => ({
          codigo: a.codigo,
          dataHora: a.dataHora, // CORRIGIDO: usa dataHora direto
          especialidade: a.consulta?.especialidade?.nome || 'N/A',
          medico: a.consulta?.medicoNome || 'N/A',
          paciente: a.pacienteNome || 'N/A', // CORRIGIDO: mostra nome do paciente
          status: a.status,
          consultaCodigo: a.consulta?.codigo
        }));
      },
      error: () => (this.agendamentos = [])
    });
  }

  // NOVO MÉTODO: Cancelar agendamento com confirmação
  cancelarAgendamento(agendamento: any): void {
    const confirmacao = confirm(`Tem certeza que deseja cancelar o agendamento ${agendamento.codigo}?`);
    if (confirmacao) {
      this.consultationService
        .cancelarConsulta(agendamento.consultaCodigo)
        .subscribe({
          next: () => {
            alert('Agendamento cancelado com sucesso!');
            this.loadConsultas();
            this.loadAgendamentos();
            this.loadConsultasDisponiveis();
          },
          error: (err) => {
            alert('Erro ao cancelar agendamento: ' + (err.error?.erro || err.message));
          }
        });
    }
  }
}
```

### **5. Employee Dashboard: `employee-dashboard.component.html`**

#### ** Tabela com Ações Baseadas nos Requisitos:**
```html
<!-- ANTES: Título "Consultas Agendadas" -->
<h3>Agendamentos (Próximas 48h)</h3>

<!-- ANTES: Exibia array 'consultas' vazio -->
<tr *ngFor="let c of consultas">

<!-- DEPOIS: Exibe array 'agendamentos' com dados -->
<tr *ngFor="let a of agendamentos">
  <td>{{ a.dataHora | date:'dd/MM/yyyy HH:mm' }}</td>
  <td>{{ a.especialidade }}</td> <!-- CORRIGIDO: não mais [object Object] -->
  <td>{{ a.medico }}</td>         <!-- CORRIGIDO: nome do médico -->
  <td>{{ a.paciente }}</td>       <!-- CORRIGIDO: nome do paciente -->
  <td>{{ a.status }}</td>
  <td>
    <!-- ADICIONADO: Botões baseados em R08, R09, R10 -->
    <button *ngIf="a.status === 'CHECK_IN'" (click)="confirmarPresenca(a)" class="btn-confirmar">
      Confirmar Presença
    </button>
    <button *ngIf="a.status === 'CRIADO' || a.status === 'CHECK_IN'" (click)="cancelarAgendamento(a)" class="btn-cancelar">
      Cancelar Agendamento
    </button>
  </td>
</tr>

<!-- ADICIONADO: Mensagem quando vazio -->
<tr *ngIf="agendamentos.length === 0">
  <td colspan="6" style="text-align: center; padding: 20px;">
    Nenhum agendamento nas próximas 48 horas.
  </td>
</tr>
```

### **6. Employee Dashboard: `employee-dashboard.component.css`**

#### ** Estilos para Botões de Ação:**
```css
/* ADICIONADO: Estilos específicos para ações */
.btn-confirmar {
  background-color: #4caf50;
  margin-right: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.btn-confirmar:hover {
  background-color: #45a049;
}

.btn-cancelar {
  background-color: #f44336;
  margin-right: 4px;
  padding: 4px 8px;
  font-size: 12px;
}

.btn-cancelar:hover {
  background-color: #da190b;
}
```

