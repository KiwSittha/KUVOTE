const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const DEFAULT_PROFILE_IMAGE = "https://cdn-icons-png.flaticon.com/512/2922/2922510.png";

const QUIZ_COLOR_PALETTE = ["#006643", "#1e40af", "#dc2626", "#f59e0b", "#7c3aed", "#0ea5e9"];

const clampQuizScore = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return Math.min(5, Math.max(1, Math.round(n)));
};

const derivePolicyScores = (candidate) => {
  const numericPolicies = Array.isArray(candidate?.policies)
    ? candidate.policies.map((v) => clampQuizScore(v)).filter((v) => v !== null)
    : [];

  if (Array.isArray(candidate?.policyScores) && candidate.policyScores.length >= 5) {
    return candidate.policyScores.slice(0, 5).map((v) => clampQuizScore(v) ?? 3);
  }

  if (Array.isArray(candidate?.policyPositions) && candidate.policyPositions.length >= 5) {
    return candidate.policyPositions.slice(0, 5).map((v) => clampQuizScore(v) ?? 3);
  }

  if (Array.isArray(candidate?.quizScores) && candidate.quizScores.length >= 5) {
    return candidate.quizScores.slice(0, 5).map((v) => clampQuizScore(v) ?? 3);
  }

  if (numericPolicies.length >= 5) {
    return numericPolicies.slice(0, 5).map((v) => v ?? 3);
  }

  // Keep quiz functional even when score vectors are not yet stored in DB.
  const seed = Number(candidate?.candidateId ?? candidate?.id ?? 1);
  return Array.from({ length: 5 }, (_, index) => ((seed + index) % 5) + 1);
};

const getPartyLabel = (candidate) => {
  const raw = candidate?.party || candidate?.partyName || candidate?.position || "Independent";
  return String(raw).trim() || "Independent";
};

const getProfileImage = (candidate) => {
  return (
    candidate?.profileImage ||
    candidate?.image ||
    candidate?.avatar ||
    candidate?.photo ||
    DEFAULT_PROFILE_IMAGE
  );
};

const getCandidateId = (candidate, index) => {
  const parsed = Number(candidate?.candidateId ?? candidate?.id);
  if (!Number.isNaN(parsed)) return parsed;
  return index + 1;
};

export const normalizeCandidate = (candidate, index = 0) => {
  const candidateId = getCandidateId(candidate, index);
  const name = String(candidate?.name || `Candidate ${candidateId}`).trim();
  const party = getPartyLabel(candidate);
  const profileImage = getProfileImage(candidate);

  return {
    ...candidate,
    id: candidateId,
    candidateId,
    name,
    party,
    profileImage,
    image: profileImage,
    bio: candidate?.bio || candidate?.faculty || "No profile description available.",
    color: candidate?.color || QUIZ_COLOR_PALETTE[index % QUIZ_COLOR_PALETTE.length],
    policyScores: derivePolicyScores(candidate),
  };
};

export const fetchCandidatesFromApi = async () => {
  const response = await fetch(`${API_BASE_URL}/candidates`);
  if (!response.ok) {
    throw new Error(`Failed to fetch candidates: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Candidates API returned invalid format");
  }

  return data
    .map((candidate, index) => normalizeCandidate(candidate, index))
    .sort((a, b) => a.candidateId - b.candidateId);
};
