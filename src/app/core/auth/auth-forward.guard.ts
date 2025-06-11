import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {AuthService} from "./auth.service";
import {Location} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class AuthForwardGuard implements CanActivate {

  // создаем конструктор для инжектирования необходимых сервисов
  constructor(private authService: AuthService, private location: Location) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // делаем проверку на регистрацию пользователя
    if (this.authService.getLoggedIn()) {
      this.location.back();
      return false;
    }

    return true;
  }

}
