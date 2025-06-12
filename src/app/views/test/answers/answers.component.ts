import {Component, OnInit} from '@angular/core';
import {QuizTestType, QuizType} from "../../../../types/quiz.type";
import {UserInfoType} from "../../../../types/user-info";
import {TestService} from "../../../shared/services/test.service";
import {ActivatedRoute} from "@angular/router";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss']
})
export class AnswersComponent implements OnInit {
  public testId: number | string = '';
  public userInfo: UserInfoType | null = null;
  public quiz!: QuizType;

  constructor(private testService: TestService,
              private activatedRoute: ActivatedRoute,
              private authService: AuthService) {
  }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.activatedRoute.queryParams.subscribe(param => {
      this.testId = param['id'];
      if (this.testId && this.userInfo) {
        this.testService.getResultDetails(this.testId, this.userInfo.userId)
          .subscribe((result: DefaultResponseType | QuizTestType) => {
            if ((result as DefaultResponseType).error !== undefined) {
              throw new Error((result as DefaultResponseType).message);
            }
            this.quiz = (result as QuizTestType).test;
            console.log(this.quiz);
          });
      }
    });
  }
}
