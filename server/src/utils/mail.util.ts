import * as nodemailer from 'nodemailer';
import Mail, { Attachment } from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

// Project-specific email template
const generateProjectTemplate = (content: string, subject: string) => `
<!DOCTYPE html>
<html>
<head>
   <meta charset="utf-8">
   <title>${subject}</title>
   <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
      .content { padding: 20px; }
      .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
      .logo { font-size: 24px; font-weight: bold; }
   </style>
</head>
<body>
   <div class="header">
      <div class="logo">🚽 National Toilet Campaign</div>
      <p>Improving Sanitation Across Nigeria</p>
   </div>
   <div class="content">
      ${content}
   </div>
   <div class="footer">
      <p>© 2025 National Toilet Campaign | Committed to Better Sanitation</p>
      <p>This is an automated message from our platform.</p>
   </div>
</body>
</html>
`;

export interface ISendMailOptions {
   to: string;
   subject: string;
   text?: string;
   html?: string;
   attachments?: Attachment[];
}

export const SendMail = async ({
   to,
   subject,
   text,
   html,
   attachments,
}: ISendMailOptions) => {
   const { MAIL_USERNAME, MAIL_PASSWORD, MAIL_HOST } = process.env;

   // Skip email in development if not configured
   if (!MAIL_HOST || !MAIL_USERNAME || !MAIL_PASSWORD) {
      console.log('📧 Email skipped (not configured):', { to, subject });
      return true;
   }

   const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: 465,
      secure: true,
      auth: {
         user: MAIL_USERNAME,
         pass: MAIL_PASSWORD,
      },
   } as SMTPTransport['options']);

   const mailOptions: Mail['options'] = {
      from: `National Toilet Campaign <${MAIL_USERNAME}>`, // Project-specific sender
      to,
      subject,
      html: html || generateProjectTemplate(text || '', subject),
      text,
      attachments,
   };

   try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully to:', to);
      return true;
   } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
   }
};

// Project-specific email templates
export const EmailTemplates = {
   reportSubmission: (
      submitterName: string,
      reportId: string,
      location: string
   ) => `
      <h2>Thank you for your submission!</h2>
      <p>Dear ${submitterName},</p>
      <p>We have received your toilet report for <strong>${location}</strong>.</p>
      <p>Your report ID is: <strong>${reportId}</strong></p>
      <p>Our team will review your submission and update the status accordingly.</p>
      <p>Thank you for contributing to better sanitation in Nigeria!</p>
   `,

   adminInvitation: (
      adminName: string,
      inviterName: string,
      role: string,
      inviteLink: string
   ) => `
      <h2>You've been invited to join as an admin</h2>
      <p>Dear ${adminName},</p>
      <p>You have been invited by ${inviterName} to join the National Toilet Campaign admin panel as a <strong>${role}</strong>.</p>
      <p>Click the link below to accept your invitation:</p>
      <p><a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a></p>
      <p>This invitation will expire in 7 days.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
   `,

   reportStatusUpdate: (
      submitterName: string,
      reportId: string,
      status: string,
      adminNotes?: string
   ) => `
      <h2>Report Status Update</h2>
      <p>Dear ${submitterName},</p>
      <p>Your toilet report (ID: ${reportId}) has been <strong>${status.toLowerCase()}</strong>.</p>
      ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
      ${status === 'APPROVED' ? '<p>Your report is now visible on our public map and will help improve sanitation awareness.</p>' : ''}
      <p>Thank you for your contribution to improving sanitation in Nigeria!</p>
   `,
};
