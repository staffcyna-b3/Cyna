function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

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
    contactNotification: {
      subject: (subject: string) => `[Contact] ${escapeHtml(subject)}`,
      html: (fromEmail: string, subject: string, message: string) => `
        <h2>Nouveau message de contact</h2>
        <p><strong>De :</strong> ${escapeHtml(fromEmail)}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
        <hr />
        <p><strong>Message :</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
        ${emailSignature()}
      `,
    },
  },
};

export default emailTemplates;
