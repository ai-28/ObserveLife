'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type WizardRole = 'staff' | 'facility_admin';

export default function AddResidentWizard({ role }: { role: WizardRole }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [residentId, setResidentId] = useState<string | null>(null);
  const [residentCredentials, setResidentCredentials] = useState<{ email: string; tempPassword: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    roomNumber: '',
    residentEmail: '',
    careType: 'SNF' as 'SNF' | 'AL' | 'HOSPICE',
    consentType: 'SELF' as 'SELF' | 'REPRESENTATIVE',
    staffName: '',
  });
  const [contacts, setContacts] = useState([{ name: '', email: '', relationship: '' }]);

  const careTypeOptions = [
    { value: 'SNF' as const, label: 'SNF/Rehab', price: '$10/resident' },
    { value: 'AL' as const, label: 'Assisted Living', price: '$8/resident' },
    { value: 'HOSPICE' as const, label: 'Hospice', price: '$15/patient' },
  ];

  const canContinue =
    (step === 1 && !!formData.firstName && !!formData.lastName && !!formData.roomNumber && !!formData.residentEmail) ||
    (step === 2 && !!formData.staffName) ||
    step === 3;

  const createResidentAndConsent = async () => {
    const userRes = await api.get('/auth/me');
    const user = userRes.data.data.user;

    if (!user.organization_id) {
      alert('You must be part of an organization');
      return null;
    }

    const residentRes = await api.post('/residents/with-user', {
      organization_id: user.organization_id,
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.residentEmail,
      room_number: formData.roomNumber,
      care_type: formData.careType,
    });

    const newResidentId = residentRes.data.data.resident.id as string;
    const newUserEmail = residentRes.data.data.user.email as string;
    const tempPassword = residentRes.data.data.temp_password as string;
    setResidentCredentials({ email: newUserEmail, tempPassword });

    await api.post('/consent', {
      resident_id: newResidentId,
      consent_type: formData.consentType,
      form_version: '1.0',
      consented_by: formData.staffName,
    });

    return newResidentId;
  };

  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setLoading(true);
      try {
        const newResidentId = await createResidentAndConsent();
        if (!newResidentId) return;
        setResidentId(newResidentId);
        setStep(3);
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to create resident');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const addContact = () => setContacts([...contacts, { name: '', email: '', relationship: '' }]);

  const updateContact = (index: number, field: string, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const removeContact = (index: number) => setContacts(contacts.filter((_, i) => i !== index));

  const validContacts = contacts.filter((c) => c.name && c.email && c.relationship);
  const validCount = validContacts.length;

  const exitAfterFamilyStep = () => {
    router.push(role === 'staff' ? '/staff/residents' : '/admin/dashboard');
  };

  const handleSendInvitations = async () => {
    if (!residentId) return;
    if (validCount === 0) {
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

      exitAfterFamilyStep();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send invitations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground mb-2 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Add New Resident (Step {step} of 3)
        </h1>
      </div>

      <Card>
        {step === 1 && (
          <div className="p-6">
            <h2 className="text-lg font-bold text-primary uppercase tracking-wider mb-4">
              Resident Information
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div>
                <label className="text-sm text-[#666] mb-1 block">First Name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Margaret"
                />
              </div>
              <div>
                <label className="text-sm text-[#666] mb-1 block">Last Name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Johnson"
                />
              </div>
              <div>
                <label className="text-sm text-[#666] mb-1 block">Room</label>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="214"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-[#666] mb-1 block">Resident Login Email</label>
              <Input
                type="email"
                value={formData.residentEmail}
                onChange={(e) => setFormData({ ...formData, residentEmail: e.target.value })}
                placeholder="margaret@example.com"
              />
              <div className="text-xs text-muted-foreground mt-1">
                We’ll create a resident login account and generate a temporary password.
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-[#666] mb-2 block">Care Type</label>
              <div className="grid grid-cols-3 gap-2">
                {careTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, careType: option.value })}
                    className={`p-2 text-center rounded border ${
                      formData.careType === option.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-[#f4f4f4] text-[#666] border-[#d0d0d0]'
                    }`}
                  >
                    <div className="text-sm font-bold">{option.label}</div>
                    <div className="text-sm opacity-70 mt-0.5">{option.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <Card className="bg-warm-light border-warm mb-4">
              <div className="p-4">
                <div className="text-lg font-bold text-warm mb-3">
                  {formData.firstName || 'Resident'} {formData.lastName} agrees to:
                </div>
                <div className="space-y-2 text-lg">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 border border-warm rounded flex items-center justify-center text-warm text-xs mt-0.5">
                      ✓
                    </div>
                    <div>Record and store stories on Observe Life</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 border border-warm rounded flex items-center justify-center text-warm text-xs mt-0.5">
                      ✓
                    </div>
                    <div>Share stories only with invited family members</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 border border-warm rounded flex items-center justify-center text-warm text-xs mt-0.5">
                      ✓
                    </div>
                    <div>Consent can be withdrawn at any time</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="mb-4">
              <label className="text-sm font-bold mb-2 block">Who is consenting?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, consentType: 'SELF' })}
                  className={`p-2 text-center rounded border ${
                    formData.consentType === 'SELF'
                      ? 'bg-teal-light border-primary border-2'
                      : 'bg-white border-[#d0d0d0] border-[1.5px]'
                  }`}
                >
                  <div className="text-sm font-bold text-primary">SELF CONSENT</div>
                  <div className="text-sm text-[#666]">Resident consents</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, consentType: 'REPRESENTATIVE' })}
                  className={`p-2 text-center rounded border ${
                    formData.consentType === 'REPRESENTATIVE'
                      ? 'bg-teal-light border-primary border-2'
                      : 'bg-white border-[#d0d0d0] border-[1.5px]'
                  }`}
                >
                  <div className="text-sm font-bold">REPRESENTATIVE</div>
                  <div className="text-sm text-[#666]">Legal rep consents</div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-[#666] mb-1 block">Staff recording consent:</label>
              <Input
                value={formData.staffName}
                onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
                placeholder="Jennifer Martinez, RN"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-dark mb-6">
              Add Family Contacts (Step 3 of 3)
            </h2>

            {residentCredentials && (
              <Card className="mb-4 border-[#d0d0d0] bg-white">
                <div className="p-4">
                  <div className="text-sm font-bold text-dark mb-2">Resident login created</div>
                  <div className="text-sm text-[#666]">
                    Email: <span className="font-semibold text-dark">{residentCredentials.email}</span>
                  </div>
                  <div className="text-sm text-[#666]">
                    Temporary password:{' '}
                    <span className="font-semibold text-dark">{residentCredentials.tempPassword}</span>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div className="p-6">
                <h3 className="text-sm font-bold text-teal uppercase tracking-wide mb-4">
                  Family Members
                </h3>

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
                            <label className="text-xs text-gray mb-1 block">Relationship</label>
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
                  disabled={loading || !residentId || validCount === 0}
                  className="w-full mb-2"
                >
                  Send All Invitations →
                </Button>
                <Button
                  variant="secondary"
                  onClick={exitAfterFamilyStep}
                  disabled={loading}
                  className="w-full"
                >
                  Skip — do this later
                </Button>
              </div>
            </Card>
          </div>
        )}

        <div className="p-6 border-t border-[#d0d0d0]">
          {step < 3 && (
            <Button onClick={handleContinue} disabled={loading || !canContinue} className="w-full">
              {loading ? 'Processing...' : 'Continue — Add Family →'}
            </Button>
          )}

          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              className="w-full mt-2"
              disabled={loading}
            >
              ← Back
            </Button>
          )}

          {/* role is currently informational, but passed to keep intent clear for future divergence */}
          <div className="sr-only">{role}</div>
        </div>
      </Card>
    </div>
  );
}

