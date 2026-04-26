const emailTemplates = {
  fr: {
    contactNotification: {
      subject: (subject: string) => `[Contact] ${subject}`,
      html: (fromEmail: string, subject: string, message: string) => `
        <h2>Nouveau message de contact</h2>
        <p><strong>De :</strong> ${fromEmail}</p>
        <p><strong>Sujet :</strong> ${subject}</p>
        <hr />
        <p><strong>Message :</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    },
  },
};

export default emailTemplates;
