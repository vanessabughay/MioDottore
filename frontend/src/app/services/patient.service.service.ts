import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface SaldoResponseDTO {
  saldoPontos: number;
}

export interface PacienteResponseDTO {
  id: number;
  cpf: string;
  nome: string;
  email: string;
  cep: string;
  endereco: string;
  saldoPontos: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientServiceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getSaldo(cpf: string): Observable<SaldoResponseDTO> {
    return this.http.get<SaldoResponseDTO>(`${this.apiUrl}/pacientes/${cpf}/saldo`, {
      headers: this.getAuthHeaders()
    });
  }
  comprarPontos(cpf: string, quantidade: number): Observable<PacienteResponseDTO> {
    const payload = { quantidadePontos: quantidade };
    return this.http.post<PacienteResponseDTO>(`${this.apiUrl}/pacientes/${cpf}/pontos/comprar`, payload, {
      headers: this.getAuthHeaders()
    });
  }
}
