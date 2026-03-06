import React from "react";
import Layout from "../components/Layout";
import PolicyQuiz from "../components/quiz/PolicyQuiz";

/**
 * MatchPage - Policy Matching Quiz Page
 * Displays the main quiz interface for users to find candidates that match their policies
 */
export default function MatchPage() {
  return (
    <Layout>
      <PolicyQuiz />
    </Layout>
  );
}