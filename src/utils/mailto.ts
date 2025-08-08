export function buildMailto({ to = [], cc = [], bcc = [], subject = '', body = '' }: { to?: string[] | string; cc?: string[]; bcc?: string[]; subject?: string; body?: string; }) {
  const params = new URLSearchParams();
  if (cc && cc.length) params.set('cc', cc.join(','));
  if (bcc && bcc.length) params.set('bcc', bcc.join(','));
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const toPart = Array.isArray(to) ? to.join(',') : to;
  return `mailto:${encodeURIComponent(toPart || '')}?${params.toString()}`;
}

export const defaultEmailContent = {
  subject: 'Healthy Homes Assessment Report',
  body: [
    'Hello,',
    '',
    'Please find the attached Healthy Homes assessment report (PDF).',
    'Send via secure email or upload to your EHR portal as appropriate.',
    '',
    'Important: Do not include personal health information in email subjects.',
    '',
    'Thank you'
  ].join('\n')
};
