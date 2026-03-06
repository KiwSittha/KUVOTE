import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { quizQuestions, calculateAllMatches } from "../../lib/quiz-database";
import { fetchCandidatesFromApi } from "../../lib/candidates-api";
import QuizResults from "./QuizResults";

const KASETSART_GREEN = "#006643";

/**
 * PolicyQuiz Component
 * Displays a 5-question policy matching quiz with 5-point scale responses
 */
export default function PolicyQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([0, 0, 0, 0, 0]); // Initialize with 0 (unanswered)
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [candidatePool, setCandidatePool] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  const [candidatesError, setCandidatesError] = useState("");

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setIsLoadingCandidates(true);
        setCandidatesError("");
        const data = await fetchCandidatesFromApi();
        setCandidatePool(data);
      } catch (error) {
        setCandidatesError(error.message || "Unable to load candidate data.");
      } finally {
        setIsLoadingCandidates(false);
      }
    };

    loadCandidates();
  }, []);

  /**
   * Handle answer selection (1-5 scale)
   */
  const handleAnswerSelect = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  /**
   * Move to next question
   */
  const goToNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  /**
   * Move to previous question
   */
  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  /**
   * Submit quiz and calculate results
   */
  const handleSubmitQuiz = () => {
    // Check if all questions are answered
    if (answers.includes(0)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    if (candidatePool.length === 0) {
      alert("Candidate data is not available yet. Please try again.");
      return;
    }

    // Calculate matches for all API-backed candidates
    const matchResults = calculateAllMatches(answers, candidatePool, "manhattan");
    setResults(matchResults);
    setShowResults(true);
  };

  /**
   * Reset quiz to start over
   */
  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([0, 0, 0, 0, 0]);
    setShowResults(false);
    setResults(null);
  };

  // Show results screen if quiz is submitted
  if (showResults && results) {
    return <QuizResults results={results} onRetake={handleRetakeQuiz} />;
  }

  const question = quizQuestions[currentQuestion];
  const isAnswered = answers[currentQuestion] !== 0;
  const allAnswered = !answers.includes(0);
  const isLastQuestion = currentQuestion === quizQuestions.length - 1;

  if (isLoadingCandidates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="mx-auto mb-4 w-10 h-10 border-4 border-gray-200 border-t-[#006643] rounded-full animate-spin" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Candidates</h2>
          <p className="text-sm text-gray-600">Fetching candidate profiles from the database...</p>
        </div>
      </div>
    );
  }

  if (candidatesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-red-700 mb-2">Unable to Start Quiz</h2>
          <p className="text-sm text-gray-700 mb-4">{candidatesError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-white font-semibold"
            style={{ backgroundColor: KASETSART_GREEN }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Quiz Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">KU Vote Policy Quiz</h1>
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: KASETSART_GREEN }}
              >
                {currentQuestion + 1} / {quizQuestions.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                  backgroundColor: KASETSART_GREEN,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-10">
            <p className="text-sm font-medium mb-2" style={{ color: KASETSART_GREEN }}>
              {question.category}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {question.statement}
            </h2>
          </div>

          {/* 5-Point Scale */}
          <div className="mb-10">
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswerSelect(value)}
                  className={`py-3 px-2 rounded-lg font-bold text-sm transition-all duration-200 transform hover:scale-105 ${
                    answers[currentQuestion] === value
                      ? "text-white text-lg shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={
                    answers[currentQuestion] === value
                      ? {
                          backgroundColor: KASETSART_GREEN,
                        }
                      : {}
                  }
                >
                  {value}
                </button>
              ))}
            </div>

            {/* Scale Labels */}
            <div className="grid grid-cols-5 gap-3 text-center">
              <p className="text-xs font-semibold text-gray-600">Strongly Disagree</p>
              <p className="text-xs text-gray-500"></p>
              <p className="text-xs font-semibold text-gray-600">Neutral</p>
              <p className="text-xs text-gray-500"></p>
              <p className="text-xs font-semibold text-gray-600">Strongly Agree</p>
            </div>
          </div>

          {/* Navigation and Submit */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={goToPreviousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            {!isLastQuestion ? (
              <button
                onClick={goToNextQuestion}
                disabled={!isAnswered}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: isAnswered ? KASETSART_GREEN : "#ccc",
                }}
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: allAnswered ? KASETSART_GREEN : "#ccc",
                }}
              >
                <span className="font-semibold">Submit Quiz</span>
              </button>
            )}
          </div>

          {/* Question Indicator */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-3">Question Progress:</p>
            <div className="flex gap-2 flex-wrap">
              {quizQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded-full font-semibold text-xs transition-all ${
                    index === currentQuestion
                      ? "shadow-lg scale-110"
                      : answers[index] !== 0
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    index === currentQuestion
                      ? {
                          backgroundColor: KASETSART_GREEN,
                          color: "white",
                        }
                      : {}
                  }
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
