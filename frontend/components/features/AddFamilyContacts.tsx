'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AddFamilyContacts() {
  const router = useRouter();
  const params = useParams();
  const residentId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([{ name: '', email: '', relationship: '' }]);

  const addContact = () => setContacts([...contacts, { name: '', email: '', relationship: '' }]);

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const removeContact = (index: number) => setContacts(contacts.filter((_, i) => i !== index));

  const handleSendInvitations = async () => {
    const validContacts = contacts.filter((c) => c.name && c.email && c.relationship);

    if (validContacts.length === 0) {
      alert('Please add at least one family member');
      return;
    }

    setLoading(true);
    try {
      await api.post('/family/invitations/batch', {
        resident_id: residentId,
        contacts: validContacts.map((c) => ({
          name: c.name,
          email: c.email,
          relationship: c.relationship,
        })),
      });

      router.push('/admin/residents');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send invitations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validCount = contacts.filter((c) => c.name && c.email && c.relationship).length;

  return (
    <div className="max-h-screen bg-[#F0F2F0] pb-20"  >
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-dark mb-6">Add Family Contacts (Step 3 of 3)</h1>

        <Card>
          <div className="p-6">
            <h2 className="text-sm font-bold text-teal uppercase tracking-wide mb-4">Family Members</h2>

            <div className="space-y-3 mb-4">
              {contacts.map((contact, index) => (
                <Card key={index} className="border-l-4 border-l-teal">
                  <div className="p-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-5">
                        <label className="text-xs text-gray mb-1 block">Name</label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                          placeholder="Sarah Johnson"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="text-xs text-gray mb-1 block">Email</label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                          placeholder="sarah@email.com"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray mb-1 block">Relation</label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                          placeholder="Granddaughter"
                        />
                      </div>
                    </div>

                    {contacts.length > 1 && (
                      <Button
                        variant="secondary"
                        onClick={() => removeContact(index)}
                        className="mt-2 text-xs"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <button
              onClick={addContact}
              className="w-full border-1 border-dashed border-gray-300 rounded p-3 text-center text-teal text-sm hover:border-teal transition"
            >
              + Add another family member
            </button>
          </div>

          <div className="p-6 border-t border-gray-200 bg-teal-light rounded-b">
            <div className="mb-4">
              <div className="text-xs font-bold text-teal mb-1">
                Ready to send {validCount} invitation{validCount !== 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray">
                Each person gets a personalized email. Free for them to join.
              </div>
            </div>

            <Button
              onClick={handleSendInvitations}
              disabled={loading || validCount === 0}
              className="w-full mb-2"
            >
              Send All Invitations →
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/admin/residents')}
              className="w-full"
            >
              Skip — do this later
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

