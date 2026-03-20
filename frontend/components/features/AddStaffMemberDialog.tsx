'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddStaffMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddStaffMemberDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddStaffMemberDialogProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    staffType: '',
    department: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.fullName || !formData.email || !formData.staffType) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Role is always 'staff' for staff members
      const requestBody: any = {
        fullName: formData.fullName,
        email: formData.email,
        role: 'staff',
        staffType: formData.staffType,
      };

      // Add department if provided
      if (formData.department) {
        requestBody.department = formData.department;
      }

      await api.post('/staff', requestBody);
      
      // Reset form
      setFormData({ fullName: '', email: '', staffType: '', department: '' });
      
      // Call onSuccess callback before closing dialog
      if (onSuccess) {
        await onSuccess();
      }
      
      // Close dialog after success callback completes
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to send invitation';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ fullName: '', email: '', staffType: '', department: '' });
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Send an invitation to a new staff member to join your facility.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input
              placeholder="Jane Smith"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              placeholder="jane@facility.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Select 
              value={formData.staffType} 
              onValueChange={(value) => setFormData({ ...formData, staffType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="facilitator">Facilitator</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Department</label>
            <Input
              placeholder="e.g., Activities, OT/PT"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              submitting || 
              !formData.fullName || 
              !formData.email || 
              !formData.staffType
            }
          >
            {submitting ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
