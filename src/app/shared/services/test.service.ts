import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {QuizListType} from "../../../types/quiz-list.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {TestResultType} from "../../../types/test-result.type";

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(private http: HttpClient) { }

  // сервис отправки запросов для получения тестов
  getTests(): Observable<QuizListType[]> {
    return this.http.get<QuizListType[]>(environment.apiHost + 'tests');
  }

  // сервис отправки запросов для получения результатов тестов
  getUserResults(userId: number): Observable<DefaultResponseType | TestResultType[]> {
    return this.http.get<DefaultResponseType | TestResultType[]>(environment.apiHost + 'tests/results?userId=' + userId);
  }

}
