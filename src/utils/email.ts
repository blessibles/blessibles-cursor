import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail({ to, subject, text, html }: EmailData): Promise<void> {
  try {
    await sgMail.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number,
  downloadLinks: Array<{ name: string; url: string }>
): Promise<void> {
  const itemsList = items
    .map((item) => `${item.name} x${item.quantity} - $${item.price.toFixed(2)}`)
    .join('\n');

  const downloadLinksList = downloadLinks
    .map((link) => `<li><a href="${link.url}">${link.name}</a></li>`)
    .join('');

  await sendEmail({
    to: email,
    subject: `Order Confirmation - #${orderNumber}`,
    text: `
Thank you for your order!

Order Number: ${orderNumber}

Items:
${itemsList}

Total: $${total.toFixed(2)}

Your digital products are ready for download. Please click the links below to access them:
${downloadLinks.map((link) => `${link.name}: ${link.url}`).join('\n')}

If you have any questions, please don't hesitate to contact us.

Best regards,
The Blessibles Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a365d;">Thank you for your order!</h1>
        
        <p>Order Number: <strong>#${orderNumber}</strong></p>
        
        <h2 style="color: #2d3748;">Order Summary</h2>
        <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px;">
          <pre style="margin: 0; white-space: pre-wrap;">${itemsList}</pre>
          <p style="margin-top: 10px; font-weight: bold;">Total: $${total.toFixed(2)}</p>
        </div>
        
        <h2 style="color: #2d3748; margin-top: 30px;">Your Downloads</h2>
        <p>Your digital products are ready for download. Click the links below to access them:</p>
        <ul style="list-style: none; padding: 0;">
          ${downloadLinksList}
        </ul>
        
        <p style="margin-top: 30px; color: #4a5568;">
          If you have any questions, please don't hesitate to contact us.
        </p>
        
        <p style="margin-top: 30px; color: #718096;">
          Best regards,<br>
          The Blessibles Team
        </p>
      </div>
    `,
  });
} 