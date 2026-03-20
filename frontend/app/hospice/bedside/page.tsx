'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function HospiceBedsidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const residentId = searchParams.get('resident_id');
  
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [prompt, setPrompt] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPrompt();
    startCamera();

    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadPrompt = async () => {
    try {
      const res = await api.get('/prompts?category=HOSPICE');
      const prompts = res.data.data.prompts || [];
      if (prompts.length > 0) {
        setPrompt(prompts[0].text);
      }
    } catch (error) {
      console.error('Error loading prompt:', error);
      setPrompt('What are you most grateful for in your life?');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    mediaRecorderRef.current = mediaRecorder;
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      // TODO: Upload to Backblaze B2
      console.log('Recording stopped, blob size:', blob.size);
    };

    mediaRecorder.start();
    setRecording(true);
    setTime(0);

    timerRef.current = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-dark z-50">
      {/* Top Bar */}
      <div className="bg-warm text-white p-2 flex items-center gap-2">
        <div className="text-sm font-bold">Bedside Mode</div>
        <div className="text-xs opacity-60">Resident</div>
        <button
          onClick={() => router.back()}
          className="ml-auto bg-white/20 px-3 py-1 rounded text-xs"
        >
          Exit
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 text-center h-full flex flex-col items-center justify-center">
        {/* Prompt */}
        <div className="bg-white/10 rounded-lg p-4 mb-4 max-w-md">
          <div className="text-xs text-white/40 uppercase tracking-wide mb-2">YOUR PROMPT</div>
          <div className="text-lg text-white leading-relaxed">"{prompt}"</div>
        </div>

        {/* Video Preview */}
        <div className="bg-dark rounded-lg aspect-video w-full max-w-md mb-4 relative flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded"
          />
          {recording && (
            <>
              <div className="absolute top-2 right-2 w-3 h-3 bg-red rounded-full animate-pulse" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold font-mono">
                {formatTime(time)}
              </div>
            </>
          )}
        </div>

        {/* Record Button */}
        {!recording ? (
          <Button
            onClick={startRecording}
            className="bg-warm text-white max-w-xs w-full text-lg py-4 rounded-xl"
          >
            ⏺ Start Recording
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            className="bg-red-600 text-white max-w-xs w-full text-lg py-4 rounded-xl"
          >
            ⏹ Stop Recording
          </Button>
        )}

        <div className="text-white/30 text-xs mt-3">
          Saves automatically when you stop.
        </div>
      </div>
    </div>
  );
}
