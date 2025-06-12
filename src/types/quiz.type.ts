export type QuizType = {
    id: number,
    name: string,
    questions: Array<QuizQuestionType>,
}

export type QuizQuestionType = {
    id: number,
    question: string,
    answers: Array<QuizUnswerType>
}

export type QuizUnswerType = {
    id: number,
    answer: string
}