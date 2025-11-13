import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generatePDFFromDocument } from './pdf-generator.js';
import { sendDocumentEmail } from './email-sender.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


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
      moduleName
    } = req.body;

    // Validate required fields
    if (!document || !recipientEmail || !recipientName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: document, recipientEmail, or recipientName'
      });
    }

    // Validate document type
    if (!document.type || !['invoice', 'receipt', 'quotation'].includes(document.type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document type. Must be: invoice, receipt, or quotation'
      });
    }

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generatePDFFromDocument(document, moduleName);
      console.log('PDF generated successfully for email');
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      return res.status(500).json({
        success: false,
        error: `Failed to generate PDF: ${pdfError.message}`
      });
    }

    // Send email with PDF attachment using NodeMailer
    const result = await sendDocumentEmail(
      recipientEmail,
      pdfBuffer,
      recipientName,
      document.type
    );

    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
      recipient: result.recipient,
      documentType: result.documentType,
      filename: result.filename
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email. Please check your SMTP configuration.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

