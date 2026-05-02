export function emailSignature(): string {
  return `
    <hr style="margin: 24px 0; border-color: #e5e7eb;" />
    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
      <strong>CYNA</strong> — Sécurisez votre futur.<br/>
      Cet email est généré automatiquement. Ne pas répondre directement à cet email.<br/>
      © 2026 CYNA. Tous droits réservés. Cet email contient des informations confidentielles destinées uniquement à son destinataire.
    </p>
  `;
}

const emailTemplates = {
  fr: {
    orderConfirmation: {
      subject: 'Confirmation de votre commande - Cyna',
      html: (amount: string, currency: string, paymentIntentId: string) => `
        <h1>Merci pour votre achat !</h1>
        <p>Votre paiement a bien été reçu. Voici le récapitulatif de votre commande :</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Montant</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${amount} ${currency.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Référence</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${paymentIntentId}</td>
          </tr>
        </table>
        <p style="margin-top: 24px;">Vous pouvez retrouver vos commandes dans votre espace personnel.</p>
        ${emailSignature()}
      `,
    },
  },
};

export default emailTemplates;
