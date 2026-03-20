'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomNav } from '@/components/layout/BottomNav';

export default function AskQuestionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<string>('');
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connections, setConnections] = useState<any[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setConnectionsLoading(true);
      try {
        const res = await api.get('/family/connections');
        const conns = res.data?.data?.connections ?? [];
        if (cancelled) return;
        setConnections(conns);
        const fromUrl = searchParams.get('resident_id');
        if (fromUrl && conns.some((c: any) => c.resident_id === fromUrl)) {
          setSelectedResidentId(fromUrl);
        } else if (conns.length > 0) {
          setSelectedResidentId(conns[0].resident_id);
        } else {
          setSelectedResidentId(null);
        }
      } catch {
        if (!cancelled) {
          setConnections([]);
          setSelectedResidentId(null);
        }
      } finally {
        if (!cancelled) setConnectionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  useEffect(() => {
    loadPrompts();
  }, [category]);

  const loadPrompts = async () => {
    try {
      const params = category ? `?category=${category}` : '';
      const res = await api.get(`/prompts${params}`);
      setPrompts(res.data.data.prompts);
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!selectedResidentId) {
      setError(
        connections.length === 0
          ? 'You are not connected to any resident yet.'
          : 'Please select a resident.'
      );
      return;
    }

    if (question.length > 500) {
      setError('Question must be 500 characters or less');
      return;
    }

    setLoading(true);

    try {
      await api.post('/questions', {
        resident_id: selectedResidentId,
        question_text: question,
        notify_all_family: true,
      });

      router.push('/family/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit question');
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelect = (promptText: string) => {
    setQuestion(promptText);
  };

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20 h-full flex flex-col">
      {/* Top Bar */}
      <div className="bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Ask a Question</h1>
      </div>

      <div className="w-full max-w-2xl mx-auto px-4 py-6 h-full max-h-screen overflow-hidden">
        <Card className="w-full">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray mb-1">
                Write Your Question
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-teal focus:border-teal min-h-[100px] resize-none"
                placeholder="What was your childhood home like?"
                maxLength={500}
                required
              />
              <div className="text-xs text-gray text-right mt-1">
                {question.length}/500
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Question →'}
            </Button>
          </form>
        </Card>

        {/* Prompt Library */}
        <div className="mt-6 h-full w-full">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                category === ''
                  ? 'bg-teal text-white'
                  : 'bg-white text-teal border border-teal'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCategory('CHILDHOOD')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                category === 'CHILDHOOD'
                  ? 'bg-teal text-white'
                  : 'bg-white text-teal border border-teal'
              }`}
            >
              Childhood
            </button>
            <button
              onClick={() => setCategory('FAMILY')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                category === 'FAMILY'
                  ? 'bg-teal text-white'
                  : 'bg-white text-teal border border-teal'
              }`}
            >
              Family
            </button>
            <button
              onClick={() => setCategory('WISDOM')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                category === 'WISDOM'
                  ? 'bg-teal text-white'
                  : 'bg-white text-teal border border-teal'
              }`}
            >
              Wisdom
            </button>
          </div>

          <div className="space-y-2 w-full max-h-[52vh] md:max-h-[52vh] pr-1 pb-24 overflow-y-auto">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                className="w-full text-left"
                onClick={() => handlePromptSelect(prompt.text)}
              >
                <Card variant="teal" className="group hover:bg-teal transition-colors">
                  <div className="text-xs font-bold text-teal mb-1 uppercase group-hover:text-white transition-colors">
                    {prompt.category}
                  </div>
                  <div className="text-sm group-hover:text-white transition-colors">{prompt.text}</div>
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav variant="family" />
    </div>
  );
}
