import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { OrderDetail } from '@/types/interfaces/Order/OrderDetail';
import { downloadInvoicePDF } from '@/utils/orderPDF';

interface Props {
  open: boolean;
  loading: boolean;
  order: OrderDetail | null;
  onClose: () => void;
}

export default function OrderDetailModal({ open, loading, order, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('orders.detailTitle')}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="space-y-3 py-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        )}

        {!loading && order && (
          <div className="space-y-5 py-2 text-sm">
            {/* Service */}
            <div>
              <p className="font-semibold text-[#181d42] mb-1">{t('orders.service')}</p>
              <p>{order.items.map((i) => (t(`products.${i.product_name}.name`) || i.product_name)).join(', ')}</p>
              {order.billing_period && (
                <p className="text-gray-500">{t(`orders.${order.billing_period}`)}</p>
              )}
              <p className="text-gray-500">{t(`orders.status.${order.status}`, { defaultValue: order.status })}</p>
            </div>

            {/* Articles + montant */}
            <div>
              <p className="font-semibold text-[#181d42] mb-1">{t('orders.amount')}</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-700">
                  <span>{t(`products.${item.product_name}.name`) || item.product_name} × {item.quantity}</span>
                  <span>
                    {(item.unit_price * item.quantity).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              ))}
              <div className="mt-2 border-t pt-2 space-y-1">
                {(order.shipping_fee ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t('shipping')}</span>
                    <span>{Number(order.shipping_fee).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                )}
                {(order.discount_amount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>
                      {t('discount') || 'Réduction'}
                      {order.promo_code ? ` (${order.promo_code})` : ''}
                    </span>
                    <span>-{Number(order.discount_amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>{t('total')}</span>
                  <span>{order.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <p className="font-semibold text-[#181d42] mb-1">{t('orders.paymentMethod')}</p>
              {order.payment_last4 ? (
                <p>{order.payment_brand ?? 'Carte'} •••• {order.payment_last4}</p>
              ) : (
                <p className="text-gray-400">{t('orders.paymentNotAvailable')}</p>
              )}
            </div>

            {/* Adresse de facturation */}
            <div>
              <p className="font-semibold text-[#181d42] mb-1">{t('orders.billingAddress')}</p>
              {order.billing_address_snapshot ? (
                <address className="not-italic text-gray-700 leading-relaxed">
                  <span>{order.billing_address_snapshot.address_line1}</span>
                  {order.billing_address_snapshot.address_line2 && (
                    <><br /><span>{order.billing_address_snapshot.address_line2}</span></>
                  )}
                  <br />
                  <span>{order.billing_address_snapshot.postcode} {order.billing_address_snapshot.city}</span>
                  <br />
                  <span>{order.billing_address_snapshot.country}</span>
                </address>
              ) : (
                <p className="text-gray-400">{t('orders.paymentNotAvailable')}</p>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => downloadInvoicePDF(order)}
            >
              {t('orders.downloadInvoice')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
