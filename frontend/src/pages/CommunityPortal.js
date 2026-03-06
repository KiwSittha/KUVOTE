import React from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Scale,
  Users,
  FileText,
  MessagesSquare,
  LayoutGrid,
  Shield,
  Target,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Layout from "../components/Layout";

const KU_GREEN = "#006643";

export default function CommunityPortal() {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ backgroundColor: KU_GREEN }}>
          <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute right-16 top-20 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute left-1/2 top-14 h-5 w-5 -translate-x-1/2 rounded-full bg-white/20" />

          <div className="relative mx-auto max-w-6xl px-6 py-20 text-center text-white">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Your Voice Shapes
              <br />
              Our University
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-emerald-50 md:text-base">
              KU Vote empowers Kasetsart University students to engage with candidate policies,
              debate key issues, and discover which platforms align with your values.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/community/discussions"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
              >
                Join the Discussion
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/match"
                className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Take Policy Match
                <Scale className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Tools */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Make an Informed Decision</h2>
            <p className="mt-2 text-sm text-slate-600">
              Two powerful tools to help you engage with the election process.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <MessageSquare className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Community Discussion</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Engage in structured conversations about candidate platforms, ask questions, and
                learn from discussions that matter most.
              </p>
              <Link
                to="/community/discussions"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: KU_GREEN }}
              >
                Browse Discussions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-amber-700">
                <Scale className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Policy Matching</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Answer a short questionnaire and see how your policy priorities align with
                candidate positions across major issues.
              </p>
              <Link
                to="/match"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: KU_GREEN }}
              >
                Take the Quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          </div>
        </section>

        {/* Engagement Stats */}
        <section className="border-y border-emerald-100 bg-emerald-50/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-8 text-center md:grid-cols-4">
            <div>
              <Users className="mx-auto h-4 w-4 text-emerald-700" />
              <p className="mt-1 text-2xl font-black text-slate-900">4</p>
              <p className="text-xs text-slate-600">Candidates</p>
            </div>
            <div>
              <FileText className="mx-auto h-4 w-4 text-emerald-700" />
              <p className="mt-1 text-2xl font-black text-slate-900">10</p>
              <p className="text-xs text-slate-600">Policy Topics</p>
            </div>
            <div>
              <MessagesSquare className="mx-auto h-4 w-4 text-emerald-700" />
              <p className="mt-1 text-2xl font-black text-slate-900">7+</p>
              <p className="text-xs text-slate-600">Discussions</p>
            </div>
            <div>
              <LayoutGrid className="mx-auto h-4 w-4 text-emerald-700" />
              <p className="mt-1 text-2xl font-black text-slate-900">4</p>
              <p className="text-xs text-slate-600">Categories</p>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Built on Trust and Transparency</h2>
          </div>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Safe Space</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Community guidelines and moderation maintain respectful, constructive discussion.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Policy-Focused</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Discussions stay centered on issues, proposals, and real impacts on students.
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Student Driven</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Designed by students, for students, with a voice-first approach to election participation.
              </p>
            </article>
          </div>
        </section>
      </div>
    </Layout>
  );
}
