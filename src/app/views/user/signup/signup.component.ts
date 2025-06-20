import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SignupResponseType} from "../../../../types/signup-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  // создаем переменную для регистрации пользователя с валидацией имени, фамилии и пароля
  signupForm = new FormGroup({
    name: new FormControl('', [Validators.pattern(/^[А-Я][а-я]+\s*$/), Validators.required]),
    lastName: new FormControl('', [Validators.pattern(/^[А-Я][а-я]+\s*$/), Validators.required]),
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/), Validators.required]),
    agree: new FormControl(false, [Validators.required]),
  });

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }

  signup(): void {
    if (this.signupForm.valid &&
      this.signupForm.value.email && this.signupForm.value.password &&
      this.signupForm.value.name && this.signupForm.value.lastName) {
      this.authService.signup(this.signupForm.value.name, this.signupForm.value.lastName,
        this.signupForm.value.email, this.signupForm.value.password)
        .subscribe({
          next: (data: SignupResponseType) => {
            if (data.error || !data.user) {
              this._snackBar.open('Ошибка при регистрации');
              throw new Error(data.message ? data.message : 'Error with data on Signup');
            }

            if (this.signupForm.value.email && this.signupForm.value.password) {
              this.authService.login(this.signupForm.value.email, this.signupForm.value.password)
                .subscribe({
                  next: (data: LoginResponseType) => {
                    if (data.error || !data.accessToken || !data.refreshToken || !data.fullName || !data.userId) {
                      this._snackBar.open('Ошибка при авторизации');
                      throw new Error(data.message ? data.message : 'Error with data on Login');
                    }

                    // функционал дублируется в компоненте login, поэтому переносится в auth.service
                    // this.authService.setUserInfo({
                    //   fullName: data.fullName,
                    //   userId: data.userId
                    // })
                    // this.authService.setTokens(data.accessToken, data.refreshToken);

                    this.router.navigate(['/choice']);
                  },
                  error: (error: HttpErrorResponse) => {
                    this._snackBar.open('Ошибка при авторизации');
                    throw new Error(error.error.message);
                  }
                })
            }

          },
          error: (error: HttpErrorResponse) => {
            this._snackBar.open('Ошибка при регистрации');
            throw new Error(error.error.message);
          }
        })
    }
  }

}
