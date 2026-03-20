'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/layout/BottomNav';

type Chip = 'All' | 'Childhood' | 'Family' | 'Wisdom';

export default function ResidentFamilyTimelinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [chip, setChip] = useState<Chip>('All');

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
      setResident(userResident || null);

      const storiesRes = await api.get('/stories');
      setStories(storiesRes.data.data.stories || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login');
      }
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = useMemo(() => {
    // Backend currently returns prompt_text but not prompt_category.
    // For now chips are UI-only until prompt category is included in /stories response.
    if (chip === 'All') return stories;
    return stories;
  }, [chip, stories]);

  const title = resident?.name ? `${resident.name.split(' ')[0]}'s Stories` : 'My Stories';

  if (loading) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] pb-20">
        <div className="bg-teal text-white p-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">{title}</h1>
          <div />
        </div>
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
      <div className="bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">{title}</h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['All', 'Childhood', 'Family', 'Wisdom'] as Chip[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  chip === c
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground border border-border hover:bg-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          {filteredStories.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-gray">
                <div className="text-4xl mb-2">🎥</div>
                <div>No stories yet.</div>
              </div>
            </Card>
          ) : (
            filteredStories.map((story) => (
              <div key={story.id} className="flex gap-3 mb-3 pb-3 border-b border-gray-200">
                <div className="w-16 h-10 bg-dark rounded flex items-center justify-center text-white text-sm flex-shrink-0">
                  ▶
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{story.title || 'Untitled Story'}</div>
                  <div className="text-xs text-gray">
                    {new Date(story.created_at).toLocaleDateString()} ·{' '}
                    {Math.floor((story.duration_seconds || 0) / 60)}:
                    {String((story.duration_seconds || 0) % 60).padStart(2, '0')}
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

