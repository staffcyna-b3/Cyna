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

export function buildReplyEmailHtml(options: {
  replyMessage: string;
  originalMessage: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px;">
      <p>${escapeHtml(options.replyMessage).replace(/\n/g, '<br/>')}</p>
      <hr style="margin: 24px 0; border-color: #e5e7eb;" />
      <p style="color: #9ca3af; font-size: 13px;">
        Message original :<br/>
        ${escapeHtml(options.originalMessage).replace(/\n/g, '<br/>')}
      </p>
      ${emailSignature()}
    </div>
  `;
}
