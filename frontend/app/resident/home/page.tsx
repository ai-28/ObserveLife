'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/features/QuestionCard';
import { StoryCard } from '@/components/features/StoryCard';
import { BottomNav } from '@/components/layout/BottomNav';

export default function ResidentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState<any>(null);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    storiesCount: 0,
    questionsCount: 0,
    familyCount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get user's resident profile
      const userRes = await api.get('/auth/me');
      const user = userRes.data.data.user;

      // Check if user is actually a resident
      if (user.role !== 'resident') {
        console.error(`User role is '${user.role}', not 'resident'. Redirecting...`);
        // Redirect based on actual role
        if (user.role === 'family') {
          router.push('/family/home');
        } else if (user.role === 'staff' || user.role === 'admin') {
          router.push('/staff');
        } else {
          router.push('/');
        }
        return;
      }

      // Get resident by user_id (for residents, this returns their own profile)
      const residentsRes = await api.get('/residents');
      const residents = residentsRes.data.data.residents || [];
      
      // Find resident linked to this user
      const userResident = residents.find(
        (r: any) => r.user_id === user.id
      );

      if (!userResident) {
        // Show message if no resident profile linked
        console.log('No resident profile found for user');
        // Don't redirect, just show empty state
        setResident(null);
        setLoading(false);
        return;
      }

      setResident(userResident);

      // Load pending questions
      const questionsRes = await api.get('/questions?status=PENDING');
      setPendingQuestions(questionsRes.data.data.questions);

      // Load stories
      const storiesRes = await api.get('/stories');
      setStories(storiesRes.data.data.stories);

      // Load stats
      const allQuestionsRes = await api.get('/questions');
      const allQuestions = allQuestionsRes.data.data.questions;
      
      setStats({
        storiesCount: storiesRes.data.data.stories.length,
        questionsCount: allQuestions.length,
        familyCount: 0, // TODO: Get from family connections
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
        return;
      }
      if (error.response?.status === 403) {
        // User doesn't have access - might not be a resident or profile not set up
        const errorMsg = error.response?.data?.error || 'Access denied';
        console.error('Access denied:', errorMsg);
        
        // Check user role and redirect if needed
        try {
          const userRes = await api.get('/auth/me');
          const user = userRes.data.data.user;
          if (user.role !== 'resident') {
            if (user.role === 'family') {
              router.push('/family/home');
            } else if (user.role === 'staff' || user.role === 'admin') {
              router.push('/staff');
            }
            return;
          }
        } catch (e) {
          // If we can't get user, just show error
        }
        
        setResident(null);
      } else {
        console.error('Error loading data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecordAnswer = (questionId: string) => {
    router.push(`/resident/record?question_id=${questionId}`);
  };

  const handleRecordStory = () => {
    router.push('/resident/record');
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

  if (!resident) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-bold mb-2">Resident Profile Not Found</h2>
          <p className="text-gray mb-4">
            Your user account is not linked to a resident profile yet. 
            Please contact staff to set up your resident profile.
          </p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20">
      {/* Top Bar */}
      <div className="bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">My Story Profile</h1>
        <Button
          onClick={handleRecordStory}
          variant="secondary"
          className="bg-white/20 text-white border-white/30 text-xs px-3 py-1"
        >
          + Record
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Profile Section */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              onClick={() => router.push('/resident/profile')}
              className="w-12 h-12 bg-teal-light border-1 border-teal rounded-full flex items-center justify-center text-teal text-lg font-bold hover:opacity-80 transition-opacity"
              aria-label="Open profile"
            >
              {resident.name?.charAt(0) || 'R'}
            </button>
            <div>
              <h2 className="text-lg font-bold text-dark">{resident.name}</h2>
              <div className="text-xs text-gray">
                {resident.organization_name || 'Mountain View'} · {resident.room_number && `Room ${resident.room_number}`}
              </div>
              <div className="text-xs text-teal mt-0.5">
                {stats.storiesCount} stories · {stats.familyCount} family members
              </div>
            </div>
          </div>
        </div>

        {/* Pending Questions */}
        {pendingQuestions.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold text-teal uppercase tracking-wide mb-3">Pending Questions</h2>
            <div className="max-h-[40vh] overflow-y-auto pr-1">
              {pendingQuestions.map((question) => (
                <Card key={question.id} className="mb-3 border-l-4 border-l-amber">
                  <div>
                    <div className="text-xs font-bold text-amber mb-1">
                      {question.asked_by_name?.toUpperCase() || 'FAMILY'} — {question.relationship || 'Family Member'}
                    </div>
                    <div className="text-sm mb-3">"{question.question_text}"</div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRecordAnswer(question.id)}
                        className="flex-1 text-xs py-2"
                      >
                        Record Answer
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {}}
                        className="flex-1 text-xs py-2"
                      >
                        Later
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* My Stories */}
        <div>
          <h2 className="text-xs font-bold text-teal uppercase tracking-wide mb-3">My Stories</h2>
          {stories.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray">
                <div className="text-4xl mb-2">🎥</div>
                <div>No stories yet. Record your first story!</div>
              </div>
            </Card>
          ) : (
            stories.map((story) => (
              <div key={story.id} className="flex gap-3 mb-3 pb-3 border-b border-gray-200">
                <div className="w-16 h-10 bg-dark rounded flex items-center justify-center text-white text-sm flex-shrink-0">
                  ▶
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{story.title || 'Untitled Story'}</div>
                  <div className="text-xs text-gray">
                    {new Date(story.created_at).toLocaleDateString()} · {Math.floor((story.duration_seconds || 0) / 60)}:{(story.duration_seconds || 0) % 60}
                  </div>
                  {story.question_id && (
                    <span className="inline-block text-xs px-2 py-0.5 bg-teal-light text-teal rounded-full mt-1">
                      Answered question
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav variant="resident" />
    </div>
  );
}
