import { MailService } from '@sendgrid/mail';
import { Request, Response } from 'express';

// Check for SendGrid API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

// Interface for email request
interface EmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Initialize SendGrid mail service if API key is available
 */
const initMailService = (): MailService | null => {
  if (!SENDGRID_API_KEY) {
    console.warn('SENDGRID_API_KEY is not set. Email functionality will be simulated.');
    return null;
  }

  const mailService = new MailService();
  mailService.setApiKey(SENDGRID_API_KEY);
  return mailService;
};

const mailService = initMailService();

/**
 * Send email handler for contact form submissions
 */
export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body as EmailRequest;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // If SendGrid is not configured, simulate success response
    if (!mailService) {
      console.log('Email would be sent (simulation):', {
        to: 'info@bluemindfreediving.com',
        from: 'noreply@bluemindfreediving.com',
        subject: `Contact Form: ${subject}`,
        text: `From: ${name} (${email})\n\n${message}`,
      });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.status(200).json({
        success: true,
        message: 'Email simulation successful'
      });
    }

    // Send actual email with SendGrid
    await mailService.send({
      to: 'info@bluemindfreediving.com',
      from: 'noreply@bluemindfreediving.com',
      subject: `Contact Form: ${subject}`,
      text: `From: ${name} (${email})\n\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send email'
    });
  }
};