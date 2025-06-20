import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },

  { path: 'cadastro', loadComponent: () => import('./pages/autocadastro/autocadastro.component').then(m => m.AutocadastroComponent) },
  
  { path: 'paciente', 
    canActivate: [authGuard],
    loadComponent: () => import('./pages/patient-dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent)
  },

  { path: 'funcionario', pathMatch: 'full',

    canActivate: [authGuard],
    loadComponent: () => import('./pages/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
  },
  { path: 'funcionario/gerenciar',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/manage-employees/manage-employees.component').then(m => m.ManageEmployeesComponent)
  },
  {
    path: 'funcionario/cadastrar-consulta',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/create-consultation/create-consultation.component').then(m => m.CreateConsultationComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
