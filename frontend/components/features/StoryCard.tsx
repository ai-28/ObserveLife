import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/Card';

interface StoryCardProps {
  story: {
    id: string;
    title?: string;
    created_at: string;
    duration_seconds?: number;
    view_count?: number;
    prompt_text?: string;
    question_text?: string;
    resident_name?: string;
  };
  showResident?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, showResident = false }) => {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Link href={`/stories/${story.id}`}>
      <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
        <div className="flex gap-3">
          <div className="w-20 h-14 bg-dark rounded flex items-center justify-center text-white text-xl flex-shrink-0">
            ▶
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-1 truncate">
              {story.title || 'Untitled Story'}
            </div>
            {showResident && story.resident_name && (
              <div className="text-xs text-gray mb-1">{story.resident_name}</div>
            )}
            <div className="flex items-center gap-3 text-xs text-gray">
              <span>{new Date(story.created_at).toLocaleDateString()}</span>
              {story.duration_seconds && (
                <>
                  <span>·</span>
                  <span>{formatDuration(story.duration_seconds)}</span>
                </>
              )}
              {story.view_count !== undefined && (
                <>
                  <span>·</span>
                  <span>{story.view_count} views</span>
                </>
              )}
            </div>
            {story.question_text && (
              <div className="mt-1">
                <span className="inline-block bg-teal-light text-teal text-xs px-2 py-0.5 rounded">
                  Answered question
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
