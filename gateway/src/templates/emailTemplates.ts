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
      `,
    },
  },
};

export default emailTemplates;