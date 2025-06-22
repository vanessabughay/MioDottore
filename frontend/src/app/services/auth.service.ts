import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Realiza login no backend e armazena o token retornado.
   */
  login(email: string, senha: string): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;

    return this.http.post<any>(url, { email, senha }).pipe(
      map(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('tipo_usuario', res.tipoUsuario);
        if (res.nomeUsuario) {
          localStorage.setItem('nome', res.nomeUsuario);
        }
        if (res.cpfUsuario) {
          localStorage.setItem('cpf', res.cpfUsuario);
        }
        return res;
      }),
      catchError(() => {
        return throwError(() => new Error('Erro ao realizar login'));
      })
    );
  }

   /**
   * Envia dados de autocadastro de paciente para o backend.
   */
  autocadastroPaciente(dados: any): Observable<any> {
    const url = `${this.apiUrl}/auth/pacientes/autocadastro`;
    return this.http.post(url, dados).pipe(
      catchError(() => {
        return throwError(() => new Error('Erro ao realizar autocadastro'));
      })
    );
  }
sendPasswordEmail(email: string, senha: string): Promise<void> {
    const serviceID = environment.emailServiceId;
    const templateID = environment.emailTemplateId;
    const publicKey = environment.emailPublicKey;

    const params = {
      to_email: email,
      senha
    };

    return emailjs.send(serviceID, templateID, params, publicKey)
      .then(() => {})
      .catch((err) => {
        console.error('Erro ao enviar e-mail', err);
      });
  }
  
  logout(): void {
    localStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getTipoUsuario(): string {
    return localStorage.getItem('tipo_usuario') || '';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
