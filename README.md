# IQR Backend API

Backend API server for the IQR document management system, deployed on Render.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `env.example`:
```bash
cp env.example .env
```

**Note**: The `env.example` file already contains the EmailJS credentials. For local development, you can use it as-is. For production on Render, you'll need to set these as environment variables in the Render dashboard.

4. Run the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

- `EMAILJS_SERVICE_ID` - Your EmailJS service ID
- `EMAILJS_TEMPLATE_ID` - Your EmailJS template ID
- `EMAILJS_PUBLIC_KEY` - Your EmailJS public key
- `EMAILJS_PRIVATE_KEY` - Your EmailJS private key
- `PORT` - Server port (default: 3001)
- Company information (optional, has defaults)

## API Endpoints

### Health Check
- `GET /health` - Check if the server is running

### Generate PDF
- `POST /api/pdf/generate`
- Body:
```json
{
  "document": { ... },
  "moduleName": "KETHU GROUPS" // optional
}
```
- Returns: `{ success: true, documentId, pdfBase64, downloadLink, filename }`

### Download PDF
- `GET /api/pdf/download/:id?base64=...` - Download a generated PDF

### Send Email
- `POST /api/email/send`
- Body:
```json
{
  "document": { ... },
  "recipientEmail": "customer@example.com",
  "recipientName": "Customer Name",
  "pdfDownloadLink": "https://...", // optional - will be auto-generated if not provided
  "moduleName": "KETHU GROUPS" // optional
}
```
- If `pdfDownloadLink` is not provided, the backend will automatically generate a PDF

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set the following:
   - **Root Directory**: Leave empty (or set to repository root)
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
4. Add all environment variables from `env.example` in Render's environment variables section:
   - `EMAILJS_SERVICE_ID=service_87lsqgg`
   - `EMAILJS_TEMPLATE_ID=tamplate_1ybmi2b`
   - `EMAILJS_PUBLIC_KEY=tCdbv6Pt8Pe2w677F`
   - `EMAILJS_PRIVATE_KEY=o5RNvcNkCAHNqI7bDYsDH`
   - `PORT=3001` (or let Render assign automatically)
   - Company information (optional)
5. Deploy!

**Important**: The backend will be deployed on Render, NOT Netlify. Make sure to use the Render backend URL in your frontend's `NEXT_PUBLIC_BACKEND_API_URL` environment variable.

