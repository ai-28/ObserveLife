'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomNav } from '@/components/layout/BottomNav';

export default function ResidentRecordPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const questionId = searchParams.get('question_id');
  const promptFromQuery = searchParams.get('prompt');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY'>('FAMILY_ONLY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState<any>(null);
  const [resident, setResident] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);

  useEffect(() => {
    loadQuestion();
    loadPrompts();
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If user selected a prompt (without a question_id), show it in the "ANSWERING QUESTION" card.
  useEffect(() => {
    if (!questionId && promptFromQuery) {
      setQuestion({
        question_text: decodeURIComponent(promptFromQuery),
      });
    }
  }, [questionId, promptFromQuery]);

  const loadQuestion = async () => {
    if (!questionId) return;

    try {
      const res = await api.get(`/questions/${questionId}`);
      setQuestion(res.data.data.question);

      const residentRes = await api.get(`/residents/${res.data.data.question.resident_id}`);
      setResident(residentRes.data.data.resident);
    } catch (e) {
      console.error('Error loading question:', e);
    }
  };

  const loadPrompts = async () => {
    try {
      const res = await api.get('/prompts');
      setPrompts(res.data.data.prompts || []);
    } catch (e) {
      console.error('Error loading prompts:', e);
    }
  };

  const handlePromptSelect = (promptText: string) => {
    setQuestion({ question_text: promptText });

    const base = pathname || '/resident/record';
    router.push(`${base}?prompt=${encodeURIComponent(promptText)}`);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (e) {
      setError('Failed to access camera. Please allow camera permissions.');
      console.error('Error accessing camera:', e);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus',
    });

    chunksRef.current = [];
    const startTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      setDuration(durationSeconds);
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setRecording(true);
    setDuration(0);

    const interval = setInterval(() => {
      if (mediaRecorder.state === 'recording') {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      } else {
        clearInterval(interval);
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopCamera();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    if (!recordedBlob || !resident) {
      setError('No recording to save');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const videoUrl = 'https://example.com/video.webm';

      await api.post('/stories', {
        resident_id: resident.id,
        title: title || undefined,
        video_url: videoUrl,
        question_id: questionId || undefined,
        privacy,
        duration_seconds: duration,
      });

      // Redirect based on role after saving
      try {
        const meRes = await api.get('/auth/me');
        const me = meRes.data.data.user;
        if (me.role === 'resident') router.push('/resident/home');
        else if (me.role === 'staff') router.push('/staff/residents');
        else if (me.role === 'facility_admin') router.push('/admin/dashboard');
        else router.push('/');
      } catch {
        router.push('/resident/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setDuration(0);
    setTitle('');
    startCamera();
  };

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Record Story</h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pt-20">

        {question && (
          <Card variant="teal" className="mb-4">
            <div className="text-xs font-bold text-teal mb-1">ANSWERING QUESTION</div>
            <div className="text-sm font-semibold">{question.question_text}</div>
          </Card>
        )}

        {error && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <div className="text-red-700 text-sm">{error}</div>
          </Card>
        )}

        {!recordedBlob ? (
          <Card>
            <div className="space-y-4">
              <div className="relative bg-dark rounded-lg aspect-video overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {recording && (
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="text-white font-mono font-bold text-lg">{formatTime(duration)}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {!recording ? (
                  <Button onClick={startRecording} className="flex-1" disabled={!stream}>
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    variant="secondary"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                  >
                    ⏹ Stop Recording
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="space-y-4">
              <div className="bg-dark rounded-lg aspect-video flex items-center justify-center">
                <video src={URL.createObjectURL(recordedBlob)} controls className="w-full h-full" />
              </div>

              <Input
                label="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story a title"
              />

              <div>
                <label className="block text-xs font-semibold text-gray mb-1">Privacy</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="FAMILY_ONLY">Family Only</option>
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleRetake} variant="secondary" className="flex-1">
                  Retake
                </Button>
                <Button onClick={handleSave} className="flex-1" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Story'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {!recording && !recordedBlob && (
          <div className="mt-6">
            <div className="text-xs font-semibold text-teal uppercase tracking-wide mb-3">
              Or Choose a Prompt
            </div>
            <div className="space-y-2 max-h-[36vh] overflow-y-auto pr-1 pb-20">
              {prompts.slice(0, 6).map((prompt) => (
                <button
                  key={prompt.id}
                  type="button"
                  className="w-full text-left"
                  onClick={() => handlePromptSelect(prompt.text)}
                >
                  <Card className="border-teal bg-teal-light group hover:bg-teal transition">
                    <div>
                      <div className="text-xs font-bold text-teal uppercase tracking-wide mb-1 group-hover:text-white transition-colors">
                        {prompt.category}
                      </div>
                      <div className="text-sm group-hover:text-white transition-colors">{prompt.text}</div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav variant="resident" />
    </div>
  );
}

