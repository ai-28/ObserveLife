'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HospicePromptsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const res = await api.get('/prompts?category=HOSPICE');
      setPrompts(res.data.data.prompts || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrompt = (promptText: string) => {
    router.push(`/hospice/bedside?prompt=${encodeURIComponent(promptText)}`);
  };

  if (loading) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-warm text-white p-3 rounded-t-lg mb-6">
          <h1 className="text-xl font-bold">Legacy Prompts</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-bold text-teal uppercase tracking-wide mb-4">
            End of Life Reflections
          </h2>
          <div className="space-y-3">
            {prompts
              .filter((p) => ['GRATITUDE', 'FAMILY', 'WISDOM', 'LEGACY'].includes(p.category))
              .map((prompt) => (
                <Card
                  key={prompt.id}
                  className="border-warm bg-warm-light cursor-pointer hover:bg-warm hover:text-white transition"
                >
                  <div className="p-4">
                    <div className="text-xs font-bold text-warm mb-1 uppercase tracking-wide">
                      {prompt.category}
                    </div>
                    <div className="text-sm">"{prompt.text}"</div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-teal uppercase tracking-wide mb-4">
            Record a Message for the Future
          </h2>
          <div className="flex flex-wrap gap-3">
            {['Wedding', 'Graduation', 'New Baby', 'Birthday'].map((occasion) => (
              <Button
                key={occasion}
                variant="secondary"
                onClick={() => router.push(`/hospice/bedside?occasion=${occasion}`)}
                className="border-warm text-warm"
              >
                {occasion === 'Wedding' && '💒 '}
                {occasion === 'Graduation' && '🎓 '}
                {occasion === 'New Baby' && '👶 '}
                {occasion === 'Birthday' && '🎂 '}
                {occasion}
              </Button>
            ))}
          </div>
          <div className="text-xs text-gray mt-3">
            Note: Milestone messages are a Phase 2 feature. Design ready, implementation pending.
          </div>
        </div>
      </div>
    </div>
  );
}
