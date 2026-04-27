export function buildReplyEmailHtml(options: {
  replyMessage: string;
  originalMessage: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px;">
      <p>${options.replyMessage.replace(/\n/g, '<br/>')}</p>
      <hr style="margin: 24px 0; border-color: #e5e7eb;" />
      <p style="color: #9ca3af; font-size: 13px;">
        Message original :<br/>
        ${options.originalMessage.replace(/\n/g, '<br/>')}
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        Cyna — secure your future
      </p>
    </div>
  `;
}
