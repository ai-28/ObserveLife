'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { BottomNav } from '@/components/layout/BottomNav';

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get user's connections
      const connectionsRes = await api.get('/family/connections');
      const connections = connectionsRes.data.data.connections || [];

      // Get stories from connected residents
      const allStories: any[] = [];
      for (const conn of connections) {
        try {
          const storiesRes = await api.get(`/stories?resident_id=${conn.resident_id}`);
          allStories.push(...(storiesRes.data.data.stories || []));
        } catch (e) {
          // Skip if error
        }
      }

      // Get questions to find answered ones
      const allQuestions: any[] = [];
      for (const conn of connections) {
        try {
          const questionsRes = await api.get(`/questions?resident_id=${conn.resident_id}`);
          allQuestions.push(...(questionsRes.data.data.questions || []));
        } catch (e) {
          // Skip if error
        }
      }

      // Build notifications
      const notifs: any[] = [];
      
      // New stories
      allStories
        .filter((s: any) => s.question_id) // Only stories that answered questions
        .forEach((story: any) => {
          const question = allQuestions.find((q: any) => q.id === story.question_id);
          if (question) {
            notifs.push({
              id: `story-${story.id}`,
              type: 'question_answered',
              title: 'Story answered your question!',
              message: `"${story.title}"`,
              questionText: question.question_text,
              storyId: story.id,
              residentId: story.resident_id,
              createdAt: story.created_at,
            });
          }
        });

      // Sort by date
      notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(notifs);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-dark mb-6">Notifications</h1>

        {notifications.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray">
              <div className="text-4xl mb-2">🔔</div>
              <div>No notifications yet</div>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card key={notif.id} className="border-l-4 border-l-teal">
                <div className="p-4">
                  <div className="flex gap-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-1">{notif.title}</div>
                      <div className="text-xs text-gray mb-2">"{notif.questionText}"</div>
                      <div className="text-sm mb-3">{notif.message}</div>
                      <Link href={`/family?story=${notif.storyId}`}>
                        <Button className="w-full sm:w-auto">Watch Now →</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav variant="family" />
    </div>
  );
}
