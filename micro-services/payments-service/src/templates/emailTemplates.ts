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
        <p>L'équipe Cyna</p>
      `,
    },
  },
};

export default emailTemplates;
