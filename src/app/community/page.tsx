"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface Answer {
  id: string;
  question_id: string;
  answer: string;
  author_name: string;
  created_at: string;
}

interface Question {
  id: string;
  question: string;
  author_name: string;
  created_at: string;
  answers?: Answer[];
}

export default function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswers, setNewAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [answerSubmitting, setAnswerSubmitting] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Mock auth: assume user is logged in
  const isLoggedIn = true;
  const user = { id: 'mock-user', name: 'You' }; // Replace with real user from auth

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      const [{ data: qData, error: qError }, { data: aData, error: aError }] = await Promise.all([
        supabase.from('forum_questions').select('*').order('created_at', { ascending: false }),
        supabase.from('forum_answers').select('*').order('created_at', { ascending: true }),
      ]);
      if (qError || aError) {
        setError('Failed to load forum data.');
        setQuestions([]);
        setAnswers([]);
      } else {
        setQuestions(qData || []);
        setAnswers(aData || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error } = await supabase.from('forum_questions').insert([
      {
        question: newQuestion,
        author_id: user.id,
        author_name: user.name,
      },
    ]);
    if (error) {
      setError('Failed to post question.');
    } else {
      setNewQuestion('');
      // Re-fetch questions
      const { data } = await supabase
        .from('forum_questions')
        .select('*')
        .order('created_at', { ascending: false });
      setQuestions(data || []);
    }
    setSubmitting(false);
  };

  const handleAnswerSubmit = async (questionId: string, e: React.FormEvent) => {
    e.preventDefault();
    setAnswerSubmitting((prev) => ({ ...prev, [questionId]: true }));
    setError('');
    const answerText = newAnswers[questionId];
    const { error } = await supabase.from('forum_answers').insert([
      {
        question_id: questionId,
        answer: answerText,
        author_id: user.id,
        author_name: user.name,
      },
    ]);
    if (error) {
      setError('Failed to post answer.');
    } else {
      setNewAnswers((prev) => ({ ...prev, [questionId]: '' }));
      // Re-fetch answers
      const { data } = await supabase
        .from('forum_answers')
        .select('*')
        .order('created_at', { ascending: true });
      setAnswers(data || []);
    }
    setAnswerSubmitting((prev) => ({ ...prev, [questionId]: false }));
  };

  // Map answers to questions
  const questionsWithAnswers = questions.map((q) => ({
    ...q,
    answers: answers.filter((a) => a.question_id === q.id),
  }));

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white py-12">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Community Forum &amp; Q&amp;A</h1>
      <div className="w-full max-w-2xl">
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="mb-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Ask a Question</h3>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type your question here..."
              required
              className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 min-h-[60px]"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white px-6 py-2 rounded font-semibold hover:bg-blue-800 transition mt-2"
              disabled={submitting || !newQuestion.trim()}
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </form>
        ) : (
          <div className="mb-8 bg-blue-50 p-4 rounded-lg text-blue-700 text-center">
            Please <Link href="/login" className="text-blue-600 underline hover:text-blue-800">log in</Link> to post a question.
          </div>
        )}
        {loading ? (
          <div className="text-blue-700">Loading questions...</div>
        ) : (
          questionsWithAnswers.map((q) => (
            <div key={q.id} className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="mb-2">
                <span className="font-semibold text-blue-900">Q:</span> {q.question}
              </div>
              <div className="text-xs text-blue-600 mb-2">Asked by {q.author_name} on {q.created_at.slice(0, 10)}</div>
              <div className="ml-4 space-y-2">
                {q.answers && q.answers.length > 0 ? (
                  q.answers.map((a) => (
                    <div key={a.id} className="bg-blue-50 rounded p-2">
                      <span className="font-semibold text-blue-800">A:</span> {a.answer}
                      <div className="text-xs text-blue-500 mt-1">By {a.author_name} on {a.created_at.slice(0, 10)}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-blue-700">No answers yet.</div>
                )}
                {isLoggedIn && (
                  <form onSubmit={(e) => handleAnswerSubmit(q.id, e)} className="mt-2">
                    <textarea
                      value={newAnswers[q.id] || ''}
                      onChange={(e) => setNewAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Type your answer..."
                      required
                      className="w-full px-3 py-2 border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 min-h-[40px]"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700 transition mt-1"
                      disabled={answerSubmitting[q.id] || !(newAnswers[q.id] && newAnswers[q.id].trim())}
                    >
                      {answerSubmitting[q.id] ? 'Posting...' : 'Post Answer'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
} 