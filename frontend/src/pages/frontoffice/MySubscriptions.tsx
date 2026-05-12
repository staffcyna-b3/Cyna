import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CancelSubscriptionModal } from '@/components/Frontoffice/CancelSubscriptionModal';
import { ReactivateSubscriptionModal } from '@/components/Frontoffice/ReactivateSubscriptionModal';
import { RefundRequestModal } from '@/components/Frontoffice/RefundRequestModal';
import {
  getMySubscriptions,
  getMyRefundRequests,
  cancelSubscription,
  reactivateSubscription,
  createRefundRequest,
  SubscriptionApiError,
} from '@/services/subscriptionService';
import { formatDate } from '@/utils/formatDate';
import type { SubscriptionDTO } from '@/types/interfaces/subscription/SubscriptionDTO.interface';

function isExpiringSoon(dateStr: string): boolean {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return new Date(dateStr) <= thirtyDaysFromNow;
}

function StatusBadge({ status }: { status: SubscriptionDTO['status'] }) {
  const { t } = useTranslation();
  const variants: Record<SubscriptionDTO['status'], string> = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[status]}`}>
      {t(`subscriptions.status.${status}`)}
    </span>
  );
}

export default function MySubscriptions() {
  const { t } = useTranslation();
  const { accessToken, isLoading } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionDTO[]>([]);
  const [activeRefundIds, setActiveRefundIds] = useState<Set<string>>(new Set());
  const [pageLoading, setPageLoading] = useState(true);

  const [cancelTarget, setCancelTarget] = useState<SubscriptionDTO | null>(null);
  const [reactivateTarget, setReactivateTarget] = useState<SubscriptionDTO | null>(null);
  const [refundTarget, setRefundTarget] = useState<SubscriptionDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    Promise.all([getMySubscriptions(accessToken), getMyRefundRequests(accessToken)])
      .then(([subs, requests]) => {
        setSubscriptions(subs);
        setActiveRefundIds(new Set(requests.map((r) => r.stripe_subscription_id)));
      })
      .catch((err) => {
        if (err instanceof SubscriptionApiError && err.status === 401) {
          toast.error(t('sessionExpired'));
        } else {
          toast.error(t('errorOccurred'));
        }
      })
      .finally(() => setPageLoading(false));
  }, [accessToken, t]);

  async function handleConfirmCancel() {
    if (!accessToken || !cancelTarget) return;
    setSubmitting(true);
    try {
      const updated = await cancelSubscription(accessToken, cancelTarget.stripe_subscription_id);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      toast.success(t('subscriptions.cancelSuccess'));
      setCancelTarget(null);
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmReactivate() {
    if (!accessToken || !reactivateTarget) return;
    setSubmitting(true);
    try {
      const updated = await reactivateSubscription(accessToken, reactivateTarget.stripe_subscription_id);
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      toast.success(t('subscriptions.reactivateSuccess'));
      setReactivateTarget(null);
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitRefundRequest(reason: string) {
    if (!accessToken || !refundTarget) return;
    setSubmitting(true);
    try {
      await createRefundRequest(accessToken, refundTarget.stripe_subscription_id, reason);
      setActiveRefundIds((prev) => new Set(prev).add(refundTarget.stripe_subscription_id));
      toast.success(t('subscriptions.refundRequestSuccess'));
      setRefundTarget(null);
    } catch {
      toast.error(t('errorOccurred'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isLoading && !accessToken) return <Navigate to="/login" replace />;
  if (isLoading || pageLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-gray-500">
        {t('loading')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-[#372cca]">{t('subscriptions.pageTitle')}</h1>

      {subscriptions.length === 0 ? (
        <p className="text-gray-500">{t('subscriptions.noSubscriptions')}</p>
      ) : (
        <ul className="space-y-4">
          {subscriptions.map((sub) => (
            <li key={sub.id} className="rounded-lg border p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {t(`products.${sub.product?.name}.name`) ?? t('subscriptions.unknownProduct')}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={sub.status} />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {sub.cancel_at_period_end ? (
                      <span className="text-orange-600">
                        {t('subscriptions.scheduledCancellation', { date: formatDate(sub.end_date, { day: 'numeric', month: 'long', year: 'numeric' }) })}
                      </span>
                    ) : (
                      t('subscriptions.renewsOn', { date: formatDate(sub.end_date, { day: 'numeric', month: 'long', year: 'numeric' }) })
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {sub.status === 'active' && !sub.cancel_at_period_end && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelTarget(sub)}
                    >
                      {t('subscriptions.cancelButton')}
                    </Button>
                  )}
                  {sub.status === 'active' && sub.cancel_at_period_end && isExpiringSoon(sub.end_date) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReactivateTarget(sub)}
                    >
                      {t('subscriptions.reactivateButton')}
                    </Button>
                  )}
                  {sub.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRefundTarget(sub)}
                      disabled={activeRefundIds.has(sub.stripe_subscription_id)}
                    >
                      {t('subscriptions.refundButton')}
                    </Button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CancelSubscriptionModal
        open={!!cancelTarget}
        periodEndDate={cancelTarget ? formatDate(cancelTarget.end_date, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        loading={submitting}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <ReactivateSubscriptionModal
        open={!!reactivateTarget}
        periodEndDate={reactivateTarget ? formatDate(reactivateTarget.end_date, { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        loading={submitting}
        onConfirm={handleConfirmReactivate}
        onCancel={() => setReactivateTarget(null)}
      />

      <RefundRequestModal
        open={!!refundTarget}
        loading={submitting}
        onSubmit={handleSubmitRefundRequest}
        onCancel={() => setRefundTarget(null)}
      />
    </div>
  );
}
