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
    confirmEmail: {
      subject: 'Confirmez votre email - Cyna',
      html: (confirmUrl: string) => `
        <h1>Bienvenue sur Cyna !</h1>
        <p>Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
        <a href="${confirmUrl}">Confirmer mon email</a>
        <p>Ou copiez-collez ce lien : ${confirmUrl}</p>
        <p>Ce lien expire dans 24h.</p>
        ${emailSignature()}
      `,
    },
    resetPassword: {
      subject: 'Réinitialiser votre mot de passe - Cyna',
      html: (resetUrl: string) => `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ou copiez-collez ce lien : ${resetUrl}</p>
        <p>Ce lien expire dans 1h.</p>
        ${emailSignature()}
      `,
    },
    twoFactorCode: {
      subject: 'Votre code de vérification - Cyna',
      html: (code: string) => `
        <h1>Code de vérification</h1>
        <p>Votre code de vérification est :</p>
        <h2 style="font-size: 32px; letter-spacing: 5px; font-weight: bold;">${code}</h2>
        <p>Ce code expire dans 5 minutes.</p>
        <p>Ne partagez ce code avec personne.</p>
        ${emailSignature()}
      `,
    },
  },
};

export default emailTemplates;