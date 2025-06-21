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

export interface TransacaoPontosResponseDTO {
  id: number;
  tipo: string;
  descricao: string;
  valorReais: number | null;
  quantidadePontos: number;
  dataHora: string;
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
    return this.http.put<PacienteResponseDTO>(`${this.apiUrl}/pacientes/${cpf}/pontos`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  getTransacoes(cpf: string): Observable<TransacaoPontosResponseDTO[]> {
    return this.http.get<TransacaoPontosResponseDTO[]>(`${this.apiUrl}/pacientes/${cpf}/transacoes`, {
      headers: this.getAuthHeaders()
    });
  }
}
