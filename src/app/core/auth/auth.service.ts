import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginResponseType} from "../../../types/login-response.type";
import {Observable, Subject, tap} from "rxjs";
import {UserInfoType} from "../../../types/user-info";
import {LogoutResponseType} from "../../../types/logout-response.type";
import {SignupResponseType} from "../../../types/signup-response.type";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // переносим из файла auth.ts и убираем static
  public accessTokenKey: string = 'accessToken';
  private refreshTokenKey: string = 'refreshToken';
  private userInfoKey: string = 'userInfo';

  // добавляем subject для оповещения и перемнную для фиксации состояния авторизации пользователя,
  // для последующего использования в header (установления кнопки Выйти) или других компонентах
  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private isLogged: boolean = false;

  constructor(private http: HttpClient) {
    // если будет не пустая строка в LocalStorage, то значение isLogged будет true, иначе - false
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }

  //создаем метод для регистрации пользователя
  signup(name: string, lastName: string, email: string, password: string): Observable<SignupResponseType> {
    return this.http.post<SignupResponseType>(environment.apiHost + 'signup', {
      name,
      lastName,
      email,
      password,
    });
  }

  // создаем метод для осуществления запроса на сервер по адресу хостинга и получения данных
  // от сервера с утверждение возвращения типа LoginResponseType
  login(email: string, password: string): Observable<LoginResponseType> {
    return this.http.post<LoginResponseType>(environment.apiHost + 'login', {
      email,
      password,
    })
      // выносим функционал авторизации в единое место для проведения промежуточной обработки данных
      // перед их отправкой в Subscribe компонентов регистрации и авторизации, откуда он выносится
      .pipe(
        tap((data: LoginResponseType) => {
          if(data.fullName && data.userId && data.accessToken && data.refreshToken) {
            this.setUserInfo({
              fullName: data.fullName,
              userId: data.userId
            })
            this.setTokens(data.accessToken, data.refreshToken);
          }
        })
      );
  }

  // создаем функцию для разлогинивания пользователя
  logout(): Observable<LogoutResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<LogoutResponseType>(environment.apiHost + 'logout', {refreshToken});
  }

  // создаем функцию для возвращения значения isLogged, поскольку оно хранит актуальное
  // значение состояния авторизации пользователя
  public getLoggedIn(): boolean {
    return this.isLogged;
  }

  // переносим и меняем методы из файла auth.ts и убираем static
  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    // при авторизации
    this.isLogged = true;
    //   когда значение меняется - транслируем новое значение
    this.isLogged$.next(true);
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    //   при разлогинивании
    this.isLogged = false;
    //   когда значение меняется - транслируем новое значение
    this.isLogged$.next(false);
  }

  public setUserInfo(info: UserInfoType): void {
    localStorage.setItem(this.userInfoKey, JSON.stringify(info));
  }

  // добавляем функцию для удаления ключей при разлогинивании
  public removeUserInfo(): void {
    localStorage.removeItem(this.userInfoKey);
  }

  public getUserInfo(): UserInfoType | null {
    const userInfo: string | null = localStorage.getItem(this.userInfoKey)
    if (userInfo) {
      return JSON.parse(userInfo);
    }
    return null;
  }

}
