import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Lista consultas agendadas para as próximas 48h
   */
  listarProximas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/consultas/proximas`, {
      headers: this.getAuthHeaders()
    });
  }

  listarDisponiveis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/consultas/disponiveis`, {
      headers: this.getAuthHeaders()
    });
  }


  /**
   * Confirma comparecimento de um agendamento
   */
  confirmarComparecimento(codigoAgendamento: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultas/agendamentos/${codigoAgendamento}/confirmar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Cancela uma consulta
   */
  cancelarConsulta(codigoConsulta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultas/${codigoConsulta}/cancelar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  /**
   * Marca consulta como realizada
   */
  realizarConsulta(codigoConsulta: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultas/${codigoConsulta}/realizar`, {}, {
      headers: this.getAuthHeaders()
    });
  }


  cadastrarConsulta(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultas/consultas`, dados, {
      headers: this.getAuthHeaders()
    });
  }

  buscarDisponiveis(especialidade?: string): Observable<any[]> {
    let url = `${this.apiUrl}/consultas/disponiveis`;
    if (especialidade) {
      url += `?especialidade=${especialidade}`;
    }
    return this.http.get<any[]>(url, { headers: this.getAuthHeaders() });
  }

  agendarConsulta(dados: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultas/agendamentos`, dados, {
      headers: this.getAuthHeaders()
    });
  }

  cancelarAgendamento(codigo: string, cpf: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/consultas/agendamentos/${codigo}/cancelar-paciente?pacienteCpf=${cpf}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  realizarCheckin(codigo: string, cpf: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/consultas/agendamentos/${codigo}/check-in?pacienteCpf=${cpf}`,
      {},
      { headers: this.getAuthHeaders() }
    );
  }
}