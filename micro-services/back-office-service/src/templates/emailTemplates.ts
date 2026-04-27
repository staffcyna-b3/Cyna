function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
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
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        Cyna — secure your future
      </p>
    </div>
  `;
}
