// для обработки запросов - обязательно добавить в provide файла app.module.ts

import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, switchMap, throwError} from "rxjs";
import {AuthService} from "./auth.service";
import {Injectable} from "@angular/core";
import {RefreshResponseType} from "../../../types/refresh-response.type";
import {Router} from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {
  }

  // каждый запрос в проекте проходит через interceptor и обрабатывается в нем
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//переменная для хранения получаемых токенов - если токены есть, они добавляются в запрос
    const tokens = this.authService.getTokens();
    //проверка наличия accessToken, если он получен, в headers добавляется x-access-token и формируется
    // новый запрос
    if (tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-access-token', tokens.accessToken)
      });
      // возможна ситуация, когда срок действия токена истек, поэтому необходимо обработать
      // ошибку 401 в данной ситуации и заново запросить токены
      return next.handle(authReq)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
              // обновляем токены если имеется ошибка
              return this.handle401Error(authReq, next)
            }
            return throwError(() => error);
          })
        );
    }
    // если токенов нет, то запрос отправляется по назначенным правилам
    return next.handle(req);
  }

  // функция для обработки ошибки и оуществления запроса на получение новых токенов
  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    // обновляем запрос на получение refresh токена
    return this.authService.refresh()
      .pipe(
        // используем для переключения нашего Observable на другой Observable, который будет возвращен
        switchMap((result: RefreshResponseType) => {
          // если токены получены, они устанавливаются в LocalStorage
          if (result && !result.error && result.accessToken && result.refreshToken) {
            this.authService.setTokens(result.accessToken, result.refreshToken);

            // гененрируем новый запрос c обновленными токенами
            const authReq = req.clone({
              headers: req.headers.set('x-access-token', result.accessToken)
            });

            // отправляем новый запрос и возвращаем новый Observable
            return next.handle(authReq);
          } else {
            return throwError(() => new Error('error'));
          }
        }),
        // если ошибка при обновлении токена, пользователь разлогинивается и направляется на главную
        catchError(error => {
          this.authService.removeTokens();
          this.authService.removeUserInfo();
          this.router.navigate(['/']);
          return throwError(() => error);
        })
      )
  }
}
