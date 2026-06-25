'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getQuestionsByCategory, categories } from '@/data/questions';

export default function QuizPage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = categories.find(c => c.slug === slug);
  const quizQuestions = getQuestionsByCategory(slug);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showResult, setShowResult] = useState(false);

  if (!category || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Category not found</p>
          <Link href="/" className="btn-torii px-6 py-2">Back to Home</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    if (answer === currentQuestion.correct_answer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowResult(false);
  };

  if (showResult) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-6">
        <div className="max-w-md w-full card-cultural p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
          <p className="text-[#5a5a5a] mb-6">Category: {category.name}</p>

          <div className="text-7xl font-black text-[#d32f2f] mb-2">
            {score} / {quizQuestions.length}
          </div>
          <p className="text-2xl font-semibold mb-8">{percentage}% Correct</p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={resetQuiz}
              className="btn-torii w-full py-3 text-lg"
            >
              Try Again
            </button>
            <Link 
              href="/"
              className="btn-gold w-full py-3 text-lg inline-block text-center"
            >
              Back to Topics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#8a8a8a] hover:text-[#d32f2f]">
            ← Back to Topics
          </Link>
          <div className="text-sm font-medium">
            {category.emoji} {category.name} • {currentIndex + 1} / {quizQuestions.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-[#f4c2c2]">
          <div 
            className="h-1 bg-[#d32f2f] transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Question Card */}
        <div className="card-cultural p-8 mb-8">
          <div className="mb-8">
            <div className="text-sm text-[#d32f2f] font-semibold mb-2">
              QUESTION {currentIndex + 1}
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              {currentQuestion.japanese_text}
            </h2>
            <p className="text-lg text-[#5a5a5a] mt-2">
              {currentQuestion.romaji} — {currentQuestion.english_translation}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.correct_answer;
              const isSelected = option === selectedAnswer;

              let className = "option-btn w-full text-left p-4 rounded-xl border-2 text-lg font-medium ";

              if (isAnswered) {
                if (isCorrect) {
                  className += "correct";
                } else if (isSelected) {
                  className += "incorrect";
                } else {
                  className += "opacity-60";
                }
              } else {
                className += "hover:bg-[#fce4ec] border-[#e5e7eb]";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={className}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        {isAnswered && (
          <div className="flex justify-end">
            <button 
              onClick={nextQuestion}
              className="btn-torii px-8 py-3 text-lg flex items-center gap-2"
            >
              {currentIndex === quizQuestions.length - 1 ? "See Results" : "Next Question"} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
