'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'family' as 'family' | 'resident' | 'staff' | 'facility_admin',
    organizationName: '',
    organizationType: '' as 'SNF' | 'AL' | 'HOSPICE' | '',
    organizationAddress: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value as 'family' | 'resident' | 'staff' | 'facility_admin' });
  };

  const handleOrganizationTypeChange = (value: string) => {
    setFormData({ ...formData, organizationType: value as 'SNF' | 'AL' | 'HOSPICE' | '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate organization fields for facility_admin
    if (formData.role === 'facility_admin') {
      if (!formData.organizationName || !formData.organizationType) {
        setError('Organization name and type are required for facility admin');
        return;
      }
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      
      // Prepare registration data
      const registrationPayload: any = {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      };

      // Add organization fields if facility_admin
      if (registerData.role === 'facility_admin') {
        registrationPayload.organizationName = registerData.organizationName;
        registrationPayload.organizationType = registerData.organizationType;
        if (registerData.organizationAddress) {
          registrationPayload.organizationAddress = registerData.organizationAddress;
        }
      }

      const response = await api.post('/auth/register', registrationPayload);
      const { token, user } = response.data.data;

      // Store token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'resident') {
        router.push('/resident/home');
      } else if (user.role === 'family') {
        router.push('/family/home');
      } else if (user.role === 'platform_admin') {
        router.push('/platform-admin/dashboard');
      } else if (user.role === 'facility_admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F0] flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold text-dark mb-2">
            Create Account
          </h1>
          <p className="text-sm text-gray">Join Observe Life</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
          />

          <div>
            <label className="block text-xs font-semibold text-gray mb-1">
              Role
            </label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="family">Family Member</SelectItem>
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="facility_admin">Facility Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'facility_admin' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray mb-1">
                  Organization Name
                </label>
                <Input
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  placeholder="Mountain View Health & Rehab"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray mb-1">
                  Organization Type
                </label>
                <Select value={formData.organizationType} onValueChange={handleOrganizationTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SNF">SNF (Skilled Nursing Facility)</SelectItem>
                    <SelectItem value="AL">AL (Assisted Living)</SelectItem>
                    <SelectItem value="HOSPICE">Hospice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                label="Organization Address"
                name="organizationAddress"
                value={formData.organizationAddress}
                onChange={handleChange}
                placeholder="123 Main St, City, State ZIP"
              />
            </>
          )}

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            minLength={8}
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray">Already have an account? </span>
          <Link href="/login" className="text-teal font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
