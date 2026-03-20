import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface QuestionCardProps {
  question: {
    id: string;
    question_text: string;
    status: 'PENDING' | 'ANSWERED';
    asked_by_name?: string;
    created_at: string;
    answered_story_id?: string;
    answered_story_title?: string;
  };
  onRecordAnswer?: (questionId: string) => void;
  showRecordButton?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onRecordAnswer,
  showRecordButton = false,
}) => {
  const isPending = question.status === 'PENDING';
  const isAnswered = question.status === 'ANSWERED';

  return (
    <Card variant={isPending ? 'amber' : 'green'} className="mb-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {question.asked_by_name && (
            <div className="text-xs font-bold text-amber mb-1">
              {question.asked_by_name.toUpperCase()}
              {isPending && ' · PENDING'}
            </div>
          )}
          <div className="text-sm font-semibold mb-2">{question.question_text}</div>
          {isAnswered && question.answered_story_title && (
            <div className="text-xs text-gray">
              ✓ Answered: {question.answered_story_title}
            </div>
          )}
          <div className="text-xs text-gray mt-1">
            {new Date(question.created_at).toLocaleDateString()}
          </div>
        </div>
        {showRecordButton && isPending && onRecordAnswer && (
          <Button
            size="sm"
            onClick={() => onRecordAnswer(question.id)}
            className="whitespace-nowrap"
          >
            Record
          </Button>
        )}
      </div>
    </Card>
  );
};
