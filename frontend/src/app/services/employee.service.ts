import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  listarFuncionarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/funcionarios`, {
      headers: this.getAuthHeaders()
    });
  }

  criarFuncionario(dados: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/funcionarios`, dados, {
      headers: this.getAuthHeaders()
    });
  }
}