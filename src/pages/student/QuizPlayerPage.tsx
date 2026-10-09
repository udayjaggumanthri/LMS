import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, CheckCircle2, AlertCircle, Award, ArrowRight, ArrowLeft } from 'lucide-react';
import { QUIZZES, COURSES } from '../../data/mockData';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';

export const QuizPlayerPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { claimCertificate } = useLearning();

  const quiz = QUIZZES[quizId || 'quiz-1'] || QUIZZES['quiz-1'];
  const associatedCourse = COURSES[0];

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(quiz.timeLimitMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const currentQ = quiz.questions[currentQuestionIdx];

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) correct++;
    });
    const percent = Math.round((correct / quiz.questions.length) * 100);
    const passed = percent >= quiz.passingScorePercent;
    return { correct, percent, passed };
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    const { passed } = calculateScore();
    if (passed) {
      claimCertificate(associatedCourse.id);
    }
  };

  const scoreData = isSubmitted ? calculateScore() : null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-left text-slate-900">
      {/* Quiz Header */}
      <div className="p-6 border border-slate-200 rounded bg-white mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
            Technical Knowledge Check
          </div>
          <h1 className="text-xl font-bold font-display text-slate-950">
            {quiz.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Passing Threshold: {quiz.passingScorePercent}% · {quiz.questions.length} Questions
          </p>
        </div>

        {!isSubmitted && (
          <div className="p-2.5 bg-slate-900 text-white rounded font-mono text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="tabular-nums font-bold">{formatTimer(secondsRemaining)}</span>
          </div>
        )}
      </div>

      {!isSubmitted ? (
        /* Quiz Active Questionnaire */
        <div className="p-6 border border-slate-200 rounded bg-white space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span>Question {currentQuestionIdx + 1} of {quiz.questions.length}</span>
            <span>
              {Object.keys(selectedAnswers).length} answered
            </span>
          </div>

          <div>
            <h3 className="font-bold text-sm text-slate-950 leading-relaxed">
              {currentQ.question}
            </h3>

            <div className="mt-4 space-y-2.5">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-3.5 rounded border text-left text-xs transition-colors flex items-center gap-3 ${
                      isSelected
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full border text-[11px] font-bold flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-emerald-800 text-white border-emerald-800' : 'border-slate-300 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>

            {currentQuestionIdx < quiz.questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={handleSubmitQuiz}
              >
                Submit & Grade Assessment &rarr;
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Scored Results & Review */
        <div className="space-y-6">
          <div className="p-8 border border-slate-200 rounded bg-white text-center space-y-3">
            {scoreData?.passed ? (
              <Award className="w-12 h-12 text-emerald-700 mx-auto" />
            ) : (
              <AlertCircle className="w-12 h-12 text-amber-600 mx-auto" />
            )}

            <h2 className="text-2xl font-bold font-display text-slate-900">
              {scoreData?.passed ? 'Assessment Passed! Distinction Earned' : 'Assessment Completed — Retake Recommended'}
            </h2>

            <div className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {scoreData?.percent}% Score
            </div>
            <p className="text-xs text-slate-500">
              You answered {scoreData?.correct} of {quiz.questions.length} questions correctly.
            </p>

            {scoreData?.passed && (
              <div className="pt-3">
                <Link to="/student/certificates">
                  <Button variant="primary" size="md">
                    Claim Official Certificate &rarr;
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Question by question explanation review */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Detailed Question Answers & Rationales
            </h3>
            {quiz.questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctOptionIndex;
              return (
                <div key={q.id} className="p-5 border border-slate-200 rounded bg-white text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Question {idx + 1}</span>
                    <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {isCorrect ? 'Correct (+20 pts)' : 'Incorrect (0 pts)'}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{q.question}</p>
                  <div className="p-2.5 bg-slate-50 rounded text-slate-600 border border-slate-100 space-y-1">
                    <div>
                      <strong>Your Answer:</strong> {userAns !== undefined ? q.options[userAns] : 'Unanswered'}
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-800 font-medium">
                        <strong>Correct Answer:</strong> {q.options[q.correctOptionIndex]}
                      </div>
                    )}
                    <div className="pt-1 text-slate-500 italic">
                      <strong>Architecture Rationale:</strong> {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <Link to={`/student/course/${associatedCourse.id}`}>
              <Button variant="outline" size="md">
                &larr; Return to Course Player
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
