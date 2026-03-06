import React from "react";
import { RotateCcw, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const KASETSART_GREEN = "#006643";

/**
 * Circular Progress Bar Component
 * Displays match percentage in a circular format
 */
const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={KASETSART_GREEN}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold" style={{ color: KASETSART_GREEN }}>
          {percentage}%
        </span>
        <span className="text-xs text-gray-600">Match</span>
      </div>
    </div>
  );
};

/**
 * QuizResults Component
 * Displays ranking of candidates with match percentages
 */
export default function QuizResults({ results, onRetake }) {
  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No results available</p>
          <button
            onClick={onRetake}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: KASETSART_GREEN }}
          >
            Start Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const topCandidate = results[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Your Results Are Ready!</h1>
          <p className="text-gray-600 text-lg">See which candidates align with your values</p>
        </div>

        {/* Top Match Card */}
        <div
          className="mb-8 p-8 rounded-2xl text-white shadow-2xl"
          style={{ backgroundColor: KASETSART_GREEN }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Top Candidate Image and Match */}
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <img
                  src={topCandidate.profileImage || topCandidate.image}
                  alt={topCandidate.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {/* Best Match Badge */}
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full px-3 py-1 font-bold text-sm shadow-lg">
                  🏆 Best Match
                </div>
              </div>
              <CircularProgress percentage={topCandidate.matchPercentage} />
            </div>

            {/* Candidate Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-medium text-gray-100 mb-1">{topCandidate.party} Party</p>
              <h2 className="text-3xl font-bold mb-3">{topCandidate.name}</h2>
              <p className="text-gray-100 leading-relaxed mb-4">{topCandidate.bio}</p>
              <div className="inline-block bg-white bg-opacity-20 px-4 py-2 rounded-lg font-semibold">
                {topCandidate.matchPercentage}% Policy Alignment
              </div>
            </div>
          </div>
        </div>

        {/* Other Candidates */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Other Candidates</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {results.slice(1).map((candidate, index) => (
              <div
                key={candidate.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Left: Image and Progress */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <img
                      src={candidate.profileImage || candidate.image}
                      alt={candidate.name}
                      className="w-24 h-24 rounded-full object-cover shadow-md mb-2 border-2 border-gray-200"
                    />
                    <div className="text-center">
                      <p className="text-2xl font-bold" style={{ color: candidate.color }}>
                        {candidate.matchPercentage}%
                      </p>
                      <p className="text-xs text-gray-600">alignment</p>
                    </div>
                  </div>

                  {/* Right: Candidate Info */}
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      #{index + 2} • {candidate.party}
                    </p>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{candidate.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{candidate.bio}</p>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${candidate.matchPercentage}%`,
                          backgroundColor: candidate.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Full Rankings</h3>
          <div className="space-y-3">
            {results.map((candidate, index) => (
              <div key={candidate.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-400 w-8">{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{candidate.name}</p>
                    <p className="text-sm text-gray-600">{candidate.party}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${candidate.matchPercentage}%`,
                        backgroundColor: candidate.color,
                      }}
                    />
                  </div>
                  <span className="font-bold text-lg w-16 text-right" style={{ color: candidate.color }}>
                    {candidate.matchPercentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={onRetake}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all hover:shadow-lg"
            style={{ backgroundColor: KASETSART_GREEN }}
          >
            <RotateCcw size={18} />
            <span>Retake Quiz</span>
          </button>
          <Link
            to="/candidates"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 transition-all"
          >
            <Users size={18} />
            <span>View All Candidates</span>
          </Link>
          <Link
            to="/community"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-gray-700 text-white hover:bg-gray-800 transition-all"
          >
            <span>Back to Community</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
