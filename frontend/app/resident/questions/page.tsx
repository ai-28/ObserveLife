'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/layout/BottomNav';

export default function QuestionQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState<any>(null);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    answered: 0,
    fromFamily: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const user = userRes.data.data.user;

      if (user.role !== 'resident') {
        router.push('/');
        return;
      }

      const residentsRes = await api.get('/residents');
      const residents = residentsRes.data.data.residents || [];
      const userResident = residents.find((r: any) => r.user_id === user.id);

      if (!userResident) {
        router.push('/resident/home');
        return;
      }

      setResident(userResident);

      // Get all questions
      const questionsRes = await api.get(`/questions?resident_id=${userResident.id}`);
      const allQuestions = questionsRes.data.data.questions || [];

      const pending = allQuestions.filter((q: any) => q.status === 'PENDING');
      const answered = allQuestions.filter((q: any) => q.status === 'ANSWERED');
      const fromFamily = allQuestions.filter((q: any) => q.asked_by_user_id !== user.id);

      setPendingQuestions(pending);
      setAnsweredQuestions(answered);
      setStats({
        pending: pending.length,
        answered: answered.length,
        fromFamily: fromFamily.length,
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAnswer = (questionId: string) => {
    router.push(`/resident/record?question_id=${questionId}`);
  };

  if (loading) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] pb-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray">Loading...</div>
          </div>
        </div>
        <BottomNav variant="resident" />
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20">
      {/* Top Bar */}
      <div className="bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Questions for You</h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          {/* Stats */}
          <div className="flex gap-4 mb-4">
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-teal">{stats.pending}</div>
              <div className="text-xs text-gray">Pending</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-green">{stats.answered}</div>
              <div className="text-xs text-gray">Answered</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-2xl font-bold text-navy">{stats.fromFamily}</div>
              <div className="text-xs text-gray">From family</div>
            </div>
          </div>
        </div>

        {/* Answer These */}
        {pendingQuestions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-teal uppercase tracking-wide mb-3">Answer These</h2>
            <div className="max-h-[40vh] overflow-y-auto pr-1 pb-24">
              {pendingQuestions.map((question) => (
                <Card key={question.id} className="mb-3 border-l-4 border-l-amber">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="text-xs font-bold text-amber mb-1">
                          {question.asked_by_name || 'Family'} · {new Date(question.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm mt-1">"{question.question_text}"</div>
                      </div>
                      <Button
                        onClick={() => handleRecordAnswer(question.id)}
                        className="whitespace-nowrap"
                      >
                        Record
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recently Answered */}
        {answeredQuestions.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-teal uppercase tracking-wide mb-3">Recently Answered</h2>
            {answeredQuestions.slice(0, 5).map((question) => (
              <Card key={question.id} className="mb-3">
                <div className="p-3 flex gap-3">
                  <div className="w-12 h-8 bg-green rounded flex items-center justify-center text-white text-sm flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{question.answered_story_title || 'Story'}</div>
                    <div className="text-xs text-gray">
                      Answered {question.asked_by_name || 'family'} · {new Date(question.updated_at).toLocaleDateString()}
                    </div>
                    <span className="inline-block text-xs px-2 py-1 bg-teal-light text-teal rounded-full mt-1">
                      Answered
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {pendingQuestions.length === 0 && answeredQuestions.length === 0 && (
          <Card>
            <div className="text-center py-8 text-gray">
              <div className="text-4xl mb-2">❓</div>
              <div>No questions yet. Family members can ask you questions!</div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav variant="resident" />
    </div>
  );
}
