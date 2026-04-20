import jsPDF from 'jspdf';
import type { OrderDetail } from '@/services/orderService';

export function useOrdersPDF() {
  const downloadInvoicePDF = (order: OrderDetail) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    doc.setFontSize(22);
    doc.setTextColor(55, 44, 202);
    doc.text('CYNA', pageWidth / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Facture', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Numéro de commande : ${order.id}`, 14, y);
    y += 7;
    doc.text(`Date : ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, 14, y);
    y += 7;
    doc.text(`Statut : ${order.status}`, 14, y);
    y += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Articles', 14, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    order.items.forEach((item) => {
      doc.text(`${item.product_name ?? 'Produit'} × ${item.quantity}`, 14, y);
      doc.text(
        (item.unit_price * item.quantity).toLocaleString('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }),
        pageWidth - 14,
        y,
        { align: 'right' }
      );
      y += 7;
    });

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total', 14, y);
    doc.text(
      order.total_amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
      pageWidth - 14,
      y,
      { align: 'right' }
    );
    y += 15;

    if (order.billing_address_snapshot) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Adresse de facturation', 14, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      const addr = order.billing_address_snapshot;
      doc.text(addr.address_line1, 14, y);
      y += 6;
      if (addr.address_line2) {
        doc.text(addr.address_line2, 14, y);
        y += 6;
      }
      doc.text(`${addr.postcode} ${addr.city}`, 14, y);
      y += 6;
      doc.text(addr.country, 14, y);
      y += 15;
    }

    if (order.payment_last4) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Mode de paiement', 14, y);
      y += 7;
      doc.setFont('helvetica', 'normal');
      doc.text(`${order.payment_brand ?? 'Carte'} •••• ${order.payment_last4}`, 14, y);
      y += 15;
    }

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Cyna — secure your future',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );

    doc.save(`facture-cyna-${order.id.slice(0, 8)}.pdf`);
  };

  return { downloadInvoicePDF };
}
