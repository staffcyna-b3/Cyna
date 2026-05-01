import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitContact } from '@/services/contactService';
import { useAuth } from '@/hooks/useAuth';

export default function Contact() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact({ email, subject, message });
      setSubmitted(true);
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#372cca] mb-4">
          {t('contact.successTitle')}
        </h1>
        <p className="text-gray-600">{t('contact.successMessage')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-[#372cca] mb-6">
        {t('contact.pageTitle')}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>{t('contact.email')}</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>{t('contact.subject')}</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>{t('contact.message')}</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-32 resize-none"
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('loading') : t('contact.submit')}
        </Button>
      </form>
    </div>
  );
}
