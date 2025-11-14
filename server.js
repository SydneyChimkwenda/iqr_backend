import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generatePDFFromDocument } from './pdf-generator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Public folder for storing PDFs
const PUBLIC_FOLDER = process.env.PUBLIC_FOLDER || join(__dirname, 'public');
const PDFS_FOLDER = join(PUBLIC_FOLDER, 'pdfs');

// Ensure public/pdfs directory exists
async function ensurePdfsDirectory() {
  try {
    if (!existsSync(PUBLIC_FOLDER)) {
      await mkdir(PUBLIC_FOLDER, { recursive: true });
      console.log(`Created public folder: ${PUBLIC_FOLDER}`);
    }
    if (!existsSync(PDFS_FOLDER)) {
      await mkdir(PDFS_FOLDER, { recursive: true });
      console.log(`Created PDFs folder: ${PDFS_FOLDER}`);
    }
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Initialize directories on startup
ensurePdfsDirectory();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from public folder
app.use('/public', express.static(PUBLIC_FOLDER));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API is running' });
});

// Generate document endpoint - generates PDF and returns public URL
app.post('/generate-document', async (req, res) => {
  try {
    const { documentType, document, moduleName } = req.body;

    // Validate documentType
    const validDocumentTypes = ['invoice', 'receipt', 'quotation'];
    if (!documentType || !validDocumentTypes.includes(documentType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: `Invalid documentType. Must be one of: ${validDocumentTypes.join(', ')}`
      });
    }

    // Validate document data
    if (!document) {
      return res.status(400).json({
        success: false,
        error: 'Document data is required'
      });
    }

    // Ensure document type matches
    if (!document.type) {
      document.type = documentType.toLowerCase();
    } else if (document.type.toLowerCase() !== documentType.toLowerCase()) {
      return res.status(400).json({
        success: false,
        error: `Document type mismatch. documentType parameter (${documentType}) does not match document.type (${document.type})`
      });
    }

    // Ensure required document fields
    if (!document.documentNumber) {
      return res.status(400).json({
        success: false,
        error: 'document.documentNumber is required'
      });
    }

    console.log(`Generating ${documentType} PDF for document: ${document.documentNumber}`);

    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generatePDFFromDocument(document, moduleName);
      console.log('PDF generated successfully');
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      return res.status(500).json({
        success: false,
        error: `PDF generation failed: ${pdfError.message || 'Unknown error'}`
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 9);
    const filename = `${documentType}_${document.documentNumber}_${timestamp}_${randomString}.pdf`;
    const filePath = join(PDFS_FOLDER, filename);

    // Ensure directory exists before writing
    await ensurePdfsDirectory();

    // Save PDF to file
    try {
      await writeFile(filePath, pdfBuffer);
      console.log(`PDF saved to: ${filePath}`);
    } catch (writeError) {
      console.error('Error saving PDF file:', writeError);
      return res.status(500).json({
        success: false,
        error: `Failed to save PDF file: ${writeError.message}`
      });
    }

    // Generate public URL
    const baseUrl = process.env.BACKEND_URL || process.env.PUBLIC_URL || `http://localhost:${PORT}`;
    const documentUrl = `${baseUrl}/public/pdfs/${filename}`;

    // Return success response
    res.json({
      success: true,
      documentUrl: documentUrl,
      documentType: documentType.toLowerCase(),
      filename: filename,
      documentNumber: document.documentNumber
    });

  } catch (error) {
    console.error('Error in /generate-document endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate document'
    });
  }
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


app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

