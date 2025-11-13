import nodemailer from 'nodemailer';

/**
 * Send email with PDF attachment using NodeMailer and Outlook SMTP
 * 
 * @param {string} recipientEmail - Recipient's email address
 * @param {Buffer} pdfBuffer - PDF file as Buffer
 * @param {string} customerName - Customer's name for personalization
 * @param {string} documentType - Type of document: 'invoice', 'receipt', or 'quotation'
 * @returns {Promise<Object>} - Email send result
 */
export async function sendDocumentEmail(recipientEmail, pdfBuffer, customerName, documentType) {
  // Validate inputs
  if (!recipientEmail || !pdfBuffer || !customerName || !documentType) {
    throw new Error('Missing required parameters: recipientEmail, pdfBuffer, customerName, and documentType are required');
  }

  // Validate document type
  const validDocumentTypes = ['invoice', 'receipt', 'quotation'];
  if (!validDocumentTypes.includes(documentType.toLowerCase())) {
    throw new Error(`Invalid document type. Must be one of: ${validDocumentTypes.join(', ')}`);
  }

  // Get environment variables for Outlook SMTP
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp-mail.outlook.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
  const SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
  const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER || 'kethugroups@hotmail.com';
  const FROM_NAME = process.env.FROM_NAME || 'Kethu Groups';

  // Validate SMTP credentials
  if (!SMTP_USER || !SMTP_PASSWORD) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD (or EMAIL_USER and EMAIL_PASSWORD) environment variables.');
  }

  // Company information
  const companyName = process.env.COMPANY_NAME || 'KETHU GROUPS';
  const companyTagline = process.env.COMPANY_TAGLINE || 'Second to None – Serving You the Best Way';
  const companyAddress = process.env.COMPANY_ADDRESS || 'P.O. Box 2069, Area 7, Lilongwe';
  const companyPhone = process.env.COMPANY_PHONE || '+265 888 921 085';
  const companyEmail = process.env.COMPANY_EMAIL || 'kethugroups@hotmail.com';

  // Format document type for display
  const documentTypeLabels = {
    invoice: 'Invoice',
    receipt: 'Receipt',
    quotation: 'Quotation'
  };
  const documentTypeLabel = documentTypeLabels[documentType.toLowerCase()] || documentType;

  // Generate dynamic subject
  const subject = `${documentTypeLabel} - ${companyName}`;

  // Generate dynamic email text
  const emailText = `Hi ${customerName},

Please find your ${documentTypeLabel} attached.

${companyName}
${companyTagline}

${companyAddress}

Tel: ${companyPhone} | Email: ${companyEmail}

Thank you for your business!`;

  // Generate dynamic filename
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `${documentType}_${timestamp}.pdf`;

  try {
    // Create transporter for Outlook SMTP
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // true for 465, false for other ports (587 uses STARTTLS)
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false, // For self-signed certificates if needed
      },
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('SMTP server connection verified successfully');

    // Send email with PDF attachment
    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: subject,
      text: emailText,
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: recipientEmail,
      documentType: documentType,
      filename: filename,
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: recipientEmail,
      documentType: documentType,
      filename: filename,
    };

  } catch (error) {
    console.error('Error sending email:', {
      error: error.message,
      stack: error.stack,
      recipient: recipientEmail,
      documentType: documentType,
    });

    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('SMTP authentication failed. Please check your email credentials.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to SMTP server. Please check your SMTP settings.');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('SMTP connection timed out. Please try again later.');
    } else {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

