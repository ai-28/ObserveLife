'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomNav } from '@/components/layout/BottomNav';

type NotificationMethod = 'EMAIL' | 'SMS' | 'NONE';

export default function FamilyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    timezone: '',
    notification_method: 'EMAIL' as NotificationMethod,
    email: '',
  });

  useEffect(() => {
    loadMe();
  }, []);

  const loadMe = async () => {
    try {
      const res = await api.get('/auth/me');
      const user = res.data.data.user;
      if (user.role !== 'family') {
        router.push('/');
        return;
      }
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        timezone: user.timezone || '',
        notification_method: (user.notification_method || 'EMAIL') as NotificationMethod,
        email: user.email || '',
      });
    } catch (e: any) {
      if (e.response?.status === 401) router.push('/login');
      setError(e.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch('/auth/me', {
        name: form.name,
        phone: form.phone || undefined,
        timezone: form.timezone || undefined,
        notification_method: form.notification_method,
      });
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="max-h-screen bg-[#F0F2F0] pb-20">
        <div className="bg-teal text-white p-3 flex items-center justify-between">
          <h1 className="text-lg font-bold">Profile</h1>
          <div />
        </div>
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
      <div className="bg-teal text-white p-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Profile</h1>
        <div />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <div className="text-red-700 text-sm">{error}</div>
          </Card>
        )}

        <Card>
          <div className="p-6 space-y-4">
            <div className="text-sm font-bold text-teal uppercase tracking-wide">Account</div>

            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input label="Email" value={form.email} disabled />

            <Input
              label="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(555) 555-5555"
            />

            <Input
              label="Timezone (optional)"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              placeholder="America/Los_Angeles"
            />

            <div>
              <label className="block text-xs font-semibold text-gray mb-1">Notifications</label>
              <select
                value={form.notification_method}
                onChange={(e) =>
                  setForm({ ...form, notification_method: e.target.value as NotificationMethod })
                }
                className="w-full px-3 py-2 border border-[#d0d0d0] rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
                <option value="NONE">None</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="secondary" onClick={handleLogout} className="flex-1">
                Logout
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav variant="family" />
    </div>
  );
}

