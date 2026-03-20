'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StoryCard } from '@/components/features/StoryCard';
import { BottomNav } from '@/components/layout/BottomNav';
import Link from 'next/link';

export default function FamilyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get family connections
      const connectionsRes = await api.get('/family/connections');
      const conns = connectionsRes.data.data.connections;
      setConnections(conns);

      if (conns.length > 0) {
        setSelectedResident(conns[0].resident_id);
        loadStories(conns[0].resident_id);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async (residentId: string) => {
    try {
      const res = await api.get(`/stories?resident_id=${residentId}`);
      const allStories = res.data.data.stories || [];
      setStories(allStories);

      // Check for answered questions (notifications)
      const questionsRes = await api.get(`/questions?resident_id=${residentId}`);
      const allQuestions = questionsRes.data.data.questions || [];
      const answeredQuestions = allQuestions.filter((q: any) => q.status === 'ANSWERED' && q.answered_story_id);
      
      const notifs = answeredQuestions.map((q: any) => {
        const story = allStories.find((s: any) => s.id === q.answered_story_id);
        return {
          questionText: q.question_text,
          storyTitle: story?.title || 'Story',
          duration: story ? `${Math.floor((story.duration_seconds || 0) / 60)}:${(story.duration_seconds || 0) % 60}` : '',
          storyId: q.answered_story_id,
        };
      });
      setNotifications(notifs);

      const pending = allQuestions.filter((q: any) => q.status === 'PENDING');
      setPendingQuestions(pending);
    } catch (error) {
      console.error('Error loading stories:', error);
    }
  };

  const handleResidentChange = (residentId: string) => {
    setSelectedResident(residentId);
    loadStories(residentId);
  };

  if (loading) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] pb-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray">Loading...</div>
          </div>
        </div>
        <BottomNav variant="family" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] pb-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
          <h2 className="text-xl font-bold mb-2">No Connections Yet</h2>
          <p className="text-gray mb-4">
            You haven't been connected to any residents yet. Wait for an invitation!
          </p>
        </Card>
        <BottomNav variant="family" />
      </div>
    );
  }

  const currentConnection = connections.find(c => c.resident_id === selectedResident);

  return (
      <div className="max-h-screen bg-[#F0F2F0] pb-20">
      {/* Top Bar */}
      <div className="bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">
          {currentConnection?.resident_name || 'Family'}'s Stories
        </h1>
        <Link href={`/ask?resident_id=${selectedResident}`}>
          <button className="bg-white/20 text-white border border-white/30 rounded px-3 py-1 text-xs font-semibold">
            Ask ❓
          </button>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
          
          {/* Resident Selector */}
          {connections.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {connections.map((conn) => (
                <button
                  key={conn.id}
                  onClick={() => handleResidentChange(conn.resident_id)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap ${
                    selectedResident === conn.resident_id
                      ? 'bg-teal text-white'
                      : 'bg-white text-teal border-1 border-teal'
                  }`}
                >
                  {conn.resident_name}
                </button>
              ))}
            </div>
          )}

        {/* Resident Info Card */}
        {currentConnection && (
          <Card className="bg-teal-light border-teal mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-teal border-1 border-teal rounded-full flex items-center justify-center text-white text-base font-bold">
                {currentConnection.resident_name?.charAt(0) || 'R'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{currentConnection.resident_name}</div>
                <div className="text-xs text-teal">
                  {stories.length} stories · {pendingQuestions?.length || 0} unanswered
                </div>
                <div className="text-xs text-gray">
                  {currentConnection.organization_name || 'Facility'}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Card */}
        {notifications.length > 0 && (
          <Card className="bg-teal-light border-l-4 border-l-teal mb-4">
            <div className="p-3">
              <div className="text-xs font-bold text-teal mb-1">🔔 NEW</div>
              <div className="text-sm font-semibold mb-1">
                {currentConnection?.resident_name} answered your question!
              </div>
              <div className="text-xs text-gray mb-2">
                "{notifications[0]?.questionText}" · {notifications[0]?.duration || '4:32'}
              </div>
              <Button className="w-full text-xs py-2">Watch Now →</Button>
            </div>
          </Card>
        )}

        {/* Stories */}
        <div>
          <h2 className="text-xs font-bold text-teal uppercase tracking-wide mb-3">All Stories</h2>
          {stories.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray">
                <div className="text-4xl mb-2">📹</div>
                <div>No stories yet. Check back soon!</div>
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
                    <span className="inline-block text-xs px-2 py-0.5 bg-green-light text-green rounded-full mt-1">
                      Answered your question
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav variant="family" />
    </div>
  );
}
