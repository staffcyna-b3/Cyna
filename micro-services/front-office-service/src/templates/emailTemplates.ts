function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
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
      `,
    },
  },
};

export default emailTemplates;
