import type {Resend as ResendType} from 'resend';

let resend: ResendType | null = null;
try {
  // Lazy import to avoid adding a hard dependency if not installed
  const {Resend} = await import('resend');
  if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
} catch {
  resend = null;
}

export async function sendReportReadyEmail(opts: {to: string; url: string}) {
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: 'AI Website Assistant <noreply@yourdomain.test>',
      to: opts.to,
      subject: 'Your website report is ready',
      html: `<p>Your report is ready: <a href="${opts.url}">${opts.url}</a></p>`
    });
    return true;
  } catch {
    return false;
  }
}



