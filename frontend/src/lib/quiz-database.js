/**
 * Policy Matching Quiz Data and Scoring Helpers
 */

// 5 Policy Questions for the Quiz
export const quizQuestions = [
  {
    id: 1,
    statement: "The university should increase funding for student scholarships.",
    category: "Student Welfare",
  },
  {
    id: 2,
    statement: "Campus should prioritize environmental sustainability initiatives.",
    category: "Campus Environment",
  },
  {
    id: 3,
    statement: "More resources should be allocated to improve campus facilities and infrastructure.",
    category: "University Budget",
  },
  {
    id: 4,
    statement: "Student mental health services should be expanded significantly.",
    category: "Student Welfare",
  },
  {
    id: 5,
    statement: "The university should strengthen community engagement and outreach programs.",
    category: "Community Engagement",
  },
];

/**
 * Calculate match percentage using Manhattan Distance
 * Converts distance to a similarity percentage (0-100)
 *
 * @param {number[]} userAnswers - Array of user's responses (1-5)
 * @param {number[]} candidatePolicies - Array of candidate's policy positions (1-5)
 * @returns {number} Match percentage (0-100)
 */
export const calculateManhattanDistance = (userAnswers, candidatePolicies) => {
  let distance = 0;
  for (let i = 0; i < userAnswers.length; i++) {
    distance += Math.abs(userAnswers[i] - candidatePolicies[i]);
  }

  // Maximum possible distance with 5 questions on 1-5 scale is 20 (5 * |1-5|)
  const maxDistance = 20;
  const similarity = ((maxDistance - distance) / maxDistance) * 100;

  return Math.round(similarity);
};

/**
 * Calculate match percentage using Euclidean Similarity
 * Formula: (1 - normalizedDistance) * 100
 *
 * @param {number[]} userAnswers - Array of user's responses (1-5)
 * @param {number[]} candidatePolicies - Array of candidate's policy positions (1-5)
 * @returns {number} Match percentage (0-100)
 */
export const calculateEuclideanSimilarity = (userAnswers, candidatePolicies) => {
  let sumOfSquares = 0;
  for (let i = 0; i < userAnswers.length; i++) {
    const diff = userAnswers[i] - candidatePolicies[i];
    sumOfSquares += diff * diff;
  }

  const distance = Math.sqrt(sumOfSquares);

  // Maximum Euclidean distance with 5 questions on 1-5 scale is sqrt(100) = 10
  const maxDistance = Math.sqrt(100);
  const similarity = ((maxDistance - distance) / maxDistance) * 100;

  return Math.round(similarity);
};

/**
 * Calculate match results for all candidates
 * Uses Manhattan Distance algorithm (more interpretable)
 *
 * @param {number[]} userAnswers - User's quiz responses
 * @param {string} method - 'manhattan' or 'euclidean' (default: 'manhattan')
 * @param {Object[]} candidateList - Normalized candidate data from API
 * @returns {Object[]} Sorted array of candidates with match percentages
 */
export const calculateAllMatches = (userAnswers, candidateList, method = "manhattan") => {
  const calculator =
    method === "euclidean" ? calculateEuclideanSimilarity : calculateManhattanDistance;

  const results = candidateList.map((candidate) => ({
    ...candidate,
    matchPercentage: calculator(userAnswers, candidate.policyScores),
  }));

  // Sort by match percentage descending
  return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
};
