import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generatePDFFromDocument } from './pdf-generator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Email HTML generation function
function generateEmailHTML(document, pdfDownloadLink, formatCurrency) {
  const documentTitle = document.type === 'invoice' ? 'INVOICE' : 
                        document.type === 'quotation' ? 'QUOTATION' : 
                        'RECEIPT';

  const documentTypeLabel = document.type === 'invoice' ? 'Invoice' : 
                            document.type === 'quotation' ? 'Quotation' : 
                            'Receipt';
  const documentNumberLabel = `${documentTypeLabel} no`;
  const documentToLabel = `${documentTypeLabel} to`;

  const documentColor = '#16a34a';
  const companyName = process.env.COMPANY_NAME || 'KETHU GROUPS';
  const companyTagline = process.env.COMPANY_TAGLINE || 'Second to None – Serving You the Best Way';
  const companyAddress = process.env.COMPANY_ADDRESS || 'P.O. Box 2069, Area 7, Lilongwe';
  const companyPhone = process.env.COMPANY_PHONE || '+265 888 921 085';
  const companyEmail = process.env.COMPANY_EMAIL || 'kethugroups@hotmail.com';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentTitle} - ${document.documentNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-top: 5px solid ${documentColor}; border-bottom: 5px solid ${documentColor}; position: relative;">
              ${document.type === 'receipt' ? `
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-12deg); z-index: 10; pointer-events: none; opacity: 0.45;">
                  <div style="border: 4px solid #dc2626; border-radius: 50%; width: 140px; height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: transparent; box-shadow: 0 3px 10px rgba(220, 38, 38, 0.3), inset 0 0 15px rgba(220, 38, 38, 0.1); position: relative; overflow: hidden; padding: 8px;">
                    <div style="font-size: 10px; font-weight: bold; color: #dc2626; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; position: relative; z-index: 1;">${companyName}</div>
                    <div style="width: 70px; height: 1.5px; background-color: #dc2626; margin-bottom: 4px; position: relative; z-index: 1;"></div>
                    <span style="font-size: 24px; font-weight: 900; color: #dc2626; letter-spacing: 4px; text-transform: uppercase; position: relative; z-index: 1;">PAID</span>
                    <div style="font-size: 8px; font-weight: 600; color: #dc2626; letter-spacing: 0.5px; margin-top: 4px; position: relative; z-index: 1;">${new Date(document.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
                  </div>
                </div>
              ` : ''}
              <tr>
                <td style="padding: 30px; border-bottom: 2px solid ${documentColor};">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td valign="top">
                        <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: bold; color: #008080;">${companyName}</h1>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #374151; font-style: italic;">${companyTagline}</p>
                        <p style="margin: 0 0 4px 0; font-size: 13px; color: #374151;">${companyAddress}</p>
                        <p style="margin: 0; font-size: 13px; color: #374151;">Tel: ${companyPhone} | Email: ${companyEmail}</p>
                      </td>
                      <td align="right">
                        <h2 style="margin: 0 0 10px 0; font-size: 36px; font-weight: bold; color: ${documentColor};">${documentTitle}</h2>
                        ${document.type === 'receipt' ? `
                          <div style="margin-bottom: 8px;">
                            <span style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 6px 16px; border-radius: 4px; font-size: 14px; font-weight: bold;">PAID</span>
                          </div>
                        ` : ''}
                        <p style="margin: 0; font-size: 14px; color: #4b5563; font-weight: 600;">${documentNumberLabel} : ${document.documentNumber}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #4b5563;">${new Date(document.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <div style="margin-bottom: 25px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #374151;">${documentToLabel} :</h3>
                    <p style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #111827;">${document.customerName}</p>
                    ${document.customerPhone ? `<p style="margin: 3px 0; font-size: 14px; color: #4b5563;">${document.customerPhone}</p>` : ''}
                    ${document.customerEmail ? `<p style="margin: 3px 0; font-size: 14px; color: #4b5563;">${document.customerEmail}</p>` : ''}
                    ${document.customerAddress ? `<p style="margin: 3px 0; font-size: 14px; color: #4b5563;">${document.customerAddress}</p>` : ''}
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; border-collapse: collapse;">
                    <thead>
                      <tr style="background-color: ${documentColor};">
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #ffffff; border: none; width: ${document.type === 'receipt' ? '4%' : '5%'};">NO</th>
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #ffffff; border: none; width: ${document.type === 'receipt' ? '38%' : '45%'};">DESCRIPTION</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: #ffffff; border: none; width: ${document.type === 'receipt' ? '10%' : '12%'};">QTY</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #ffffff; border: none; width: ${document.type === 'receipt' ? '15%' : '18%'};">PRICE</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #ffffff; border: none; width: ${document.type === 'receipt' ? '16%' : '20%'};">TOTAL</th>
                        ${document.type === 'receipt' ? '<th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #ffffff; border: none; width: 17%;">BALANCE</th>' : ''}
                      </tr>
                    </thead>
                    <tbody>
                      ${document.items.map((item, index) => `
                        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f0fdf4'};">
                          <td style="padding: 12px; font-size: 14px; color: #374151; border: none;">${index + 1}</td>
                          <td style="padding: 12px; font-size: 14px; color: #111827; font-weight: 500; border: none;">${item.description}</td>
                          <td style="padding: 12px; text-align: center; font-size: 14px; color: #374151; border: none;">${item.quantity}</td>
                          <td style="padding: 12px; text-align: right; font-size: 14px; color: #374151; border: none;">${formatCurrency(item.unitPrice)}</td>
                          <td style="padding: 12px; text-align: right; font-size: 14px; color: #111827; font-weight: 600; border: none;">${formatCurrency(item.total)}</td>
                          ${document.type === 'receipt' ? `<td style="padding: 12px; text-align: right; font-size: 14px; color: #16a34a; font-weight: 600; border: none;">${formatCurrency(0)}</td>` : ''}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                    <tr>
                      <td align="right">
                        <table cellpadding="0" cellspacing="0" style="width: 280px;">
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #374151; font-weight: 500;">Sub Total :</td>
                            <td align="right" style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600;">${formatCurrency(document.subtotal)}</td>
                          </tr>
                          ${document.discount > 0 ? `
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 500;">Discount (${document.discount}%) :</td>
                              <td align="right" style="padding: 8px 0; font-size: 14px; color: #dc2626; font-weight: 600;">-${formatCurrency((document.subtotal * document.discount) / 100)}</td>
                            </tr>
                          ` : ''}
                          ${document.taxRate > 0 ? `
                            <tr>
                              <td style="padding: 8px 0; font-size: 14px; color: #374151; font-weight: 500;">VAT ${document.taxRate}% :</td>
                              <td align="right" style="padding: 8px 0; font-size: 14px; color: #111827; font-weight: 600;">${formatCurrency(document.taxAmount)}</td>
                            </tr>
                          ` : ''}
                          <tr>
                            <td colspan="2" style="padding-top: 12px;">
                              <div style="background-color: ${documentColor}; padding: 12px; color: #ffffff;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="font-size: 16px; font-weight: bold; color: #ffffff;">GRAND TOTAL :</td>
                                    <td align="right" style="font-size: 16px; font-weight: bold; color: #ffffff;">${formatCurrency(document.total)}</td>
                                  </tr>
                                </table>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  ${pdfDownloadLink ? `
                  <div style="margin-bottom: 25px; text-align: center;">
                    <a href="${pdfDownloadLink}" style="display: inline-block; background-color: ${documentColor}; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">📥 Download PDF Document</a>
                  </div>
                  ` : ''}
                  
                  <div style="border-top: 2px solid ${documentColor}; padding-top: 20px; text-align: center;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 500; color: #374151;">Be rest assured of the best service possible.</p>
                    <p style="margin: 0; font-size: 13px; color: ${documentColor}; font-weight: 500;">📞 ${companyPhone} | ✉️ ${companyEmail} | 📍 ${companyAddress}</p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

// Generate PDF endpoint
app.post('/api/pdf/generate', async (req, res) => {
  try {
    const { document, moduleName } = req.body;

    // Validate required fields
    if (!document || !document.type || !document.documentNumber) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document data. Document, type, and documentNumber are required.'
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDFFromDocument(document, moduleName);
    
    // Convert to base64 for easy transmission
    const pdfBase64 = pdfBuffer.toString('base64');
    
    // Create a download link (using the backend URL)
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const documentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const downloadLink = `${baseUrl}/api/pdf/download/${documentId}?base64=${encodeURIComponent(pdfBase64)}`;

    res.json({
      success: true,
      documentId,
      pdfBase64,
      downloadLink,
      filename: `${document.type}_${document.documentNumber}.pdf`
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate PDF'
    });
  }
});

// Download PDF endpoint (for serving the generated PDF)
app.get('/api/pdf/download/:id', (req, res) => {
  try {
    const { base64 } = req.query;
    
    if (!base64) {
      return res.status(400).json({
        error: 'PDF data not found'
      });
    }

    const pdfBuffer = Buffer.from(base64, 'base64');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="document.pdf"`);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({
      error: 'Failed to serve PDF'
    });
  }
});

// Send email endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const {
      document,
      recipientEmail,
      recipientName,
      pdfDownloadLink,
      moduleName
    } = req.body;

    // Validate required fields
    if (!document || !recipientEmail || !recipientName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: document, recipientEmail, or recipientName'
      });
    }

    // Generate PDF if not provided
    let finalPdfDownloadLink = pdfDownloadLink;
    if (!finalPdfDownloadLink) {
      try {
        const pdfBuffer = await generatePDFFromDocument(document, moduleName);
        const pdfBase64 = pdfBuffer.toString('base64');
        const baseUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
        const documentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        finalPdfDownloadLink = `${baseUrl}/api/pdf/download/${documentId}?base64=${encodeURIComponent(pdfBase64)}`;
      } catch (pdfError) {
        console.warn('PDF generation failed, sending email without PDF link:', pdfError);
        // Continue without PDF link
      }
    }

    // Check if EmailJS is configured
    const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
    const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
    const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
    const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'EmailJS is not configured. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY in environment variables.'
      });
    }

    // Generate email HTML
    const documentTitle = document.type === 'invoice' ? 'Invoice' : 
                          document.type === 'quotation' ? 'Quotation' : 
                          'Receipt';
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-MW', {
        style: 'currency',
        currency: 'MWK',
      }).format(amount);
    };

    const documentHtml = generateEmailHTML(document, finalPdfDownloadLink, formatCurrency);

    // Prepare template parameters
    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      from_name: process.env.COMPANY_NAME || 'KETHU GROUPS',
      from_email: process.env.FROM_EMAIL || 'kethugroups@hotmail.com',
      reply_to: process.env.REPLY_TO_EMAIL || 'kethugroups@hotmail.com',
      subject: `${documentTitle} - ${document.documentNumber}`,
      message: `Please find the ${documentTitle.toLowerCase()} ${document.documentNumber} attached.${finalPdfDownloadLink ? ` Download PDF: ${finalPdfDownloadLink}` : ''}`,
      document_html: documentHtml,
      document_number: document.documentNumber,
      document_type: documentTitle,
      total_amount: formatCurrency(document.total),
      document_date: new Date(document.date).toLocaleDateString(),
      pdf_download_link: finalPdfDownloadLink || '',
    };

    // Send email using EmailJS REST API
    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;
    
    const emailjsResponse = await fetch(emailjsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        accessToken: EMAILJS_PRIVATE_KEY,
        template_params: templateParams,
      }),
    });

    if (!emailjsResponse.ok) {
      const errorData = await emailjsResponse.text();
      throw new Error(`EmailJS API error: ${emailjsResponse.status} - ${errorData}`);
    }

    const result = await emailjsResponse.json();

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.text || 'Email sent'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email. Please check your EmailJS configuration.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

