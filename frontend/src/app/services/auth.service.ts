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
   * Simula login verificando email e senha na base local (json-server).
   */
  login(email: string, senha: string): Observable<any> {
    const url = `${this.apiUrl}/usuarios?email=${email}&senha=${senha}`;

    return this.http.get<any[]>(url).pipe(
      map(users => {
        if (users.length === 1) {
          const user = users[0];

          // Armazena os dados no localStorage
          localStorage.setItem('token', 'fake-token');
          localStorage.setItem('tipo_usuario', user.tipo_usuario);
          localStorage.setItem('nome', user.nome);
          localStorage.setItem('pontos', String(user.pontos ?? '0'));

          return user;
        } else {
          throw new Error('Login inválido');
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Erro ao realizar login'));
      })
    );
  }

  /**
   * Cadastra um novo usuário na base local (json-server).
   */
  register(user: any): Observable<any> {
    const url = `${this.apiUrl}/usuarios`;
    return this.http.post(url, user).pipe(
      catchError(() => {
        return throwError(() => new Error('Erro ao realizar cadastro'));
      })
    );
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
