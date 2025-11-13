import puppeteer from 'puppeteer';

// HTML template for PDF generation (same as frontend)
function generateDocumentHTML(document, moduleName, formatCurrency) {
  const companyName = moduleName || process.env.COMPANY_NAME || 'KETHU GROUPS';
  const documentTitle = document.type === 'invoice' ? 'INVOICE' : 
                        document.type === 'quotation' ? 'QUOTATION' : 
                        'RECEIPT';
  
  const documentTypeLabel = document.type === 'invoice' ? 'Invoice' : 
                            document.type === 'quotation' ? 'Quotation' : 
                            'Receipt';
  const documentNumberLabel = `${documentTypeLabel} no`;
  const documentToLabel = `${documentTypeLabel} to`;

  const primaryColor = '#16a34a';
  const kethuConsultTagline = process.env.COMPANY_TAGLINE || 'Second to None – Serving You the Best Way';
  const kethuConsultAddress = process.env.COMPANY_ADDRESS || 'P.O. Box 2069, Area 7, Lilongwe';
  const kethuConsultPhone = process.env.COMPANY_PHONE || '+265 888 921 085';
  const kethuConsultEmail = process.env.COMPANY_EMAIL || 'kethugroups@hotmail.com';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          width: 210mm;
          min-height: 297mm;
          height: 297mm;
          margin: 0 auto;
          padding: 15px 25px;
          border-top: 5px solid ${primaryColor};
          border-bottom: 5px solid ${primaryColor};
          display: flex;
          flex-direction: column;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 10px;
        }
        .company-info {
          display: flex;
          align-items: start;
          gap: 12px;
        }
        .logo {
          width: 60px;
          height: 60px;
          object-fit: contain;
        }
        .company-name {
          font-size: 22px;
          font-weight: bold;
          color: #008080;
          margin-bottom: 2px;
        }
        .tagline {
          font-size: 11px;
          color: #374151;
          font-style: italic;
          margin-bottom: 4px;
        }
        .address {
          font-size: 11px;
          color: #374151;
          line-height: 1.3;
        }
        .document-title {
          text-align: right;
        }
        .title-text {
          font-size: 32px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 4px;
        }
        .paid-badge {
          display: inline-block;
          background-color: #dc2626;
          color: white;
          padding: 6px 16px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 6px;
        }
        .document-number {
          font-size: 11px;
          color: #374151;
          font-weight: 600;
        }
        .date {
          font-size: 11px;
          color: #374151;
          margin-top: 2px;
        }
        .separator {
          border-bottom: 2px solid ${primaryColor};
          margin-bottom: 10px;
        }
        .customer-section {
          margin-bottom: 10px;
        }
        .customer-label {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .customer-name {
          font-size: 16px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 2px;
        }
        .customer-detail {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.3;
          margin-bottom: 1px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        thead tr {
          background-color: ${primaryColor};
        }
        th {
          padding: 8px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #ffffff;
        }
        th.text-center { text-align: center; }
        th.text-right { text-align: right; }
        tbody tr {
          background-color: #ffffff;
        }
        tbody tr:nth-child(even) {
          background-color: #E0F6FF;
        }
        td {
          padding: 8px;
          font-size: 13px;
          color: #374151;
        }
        td.text-center { text-align: center; }
        td.text-right { text-align: right; }
        .description {
          color: #111827;
          font-weight: 500;
        }
        .total {
          color: #111827;
          font-weight: 600;
        }
        .balance {
          color: #16a34a;
          font-weight: 600;
        }
        .summary {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
        }
        .summary-box {
          width: 320px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 13px;
        }
        .summary-label {
          color: #374151;
          font-weight: 500;
        }
        .summary-value {
          color: #111827;
          font-weight: 600;
        }
        .grand-total {
          background-color: ${primaryColor};
          color: #ffffff;
          padding: 10px 12px;
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: bold;
        }
        .spacer {
          flex: 1;
          min-height: 20px;
        }
        .payment-method {
          background-color: ${primaryColor};
          color: #ffffff;
          padding: 12px;
          margin-bottom: 8px;
        }
        .payment-title {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .payment-detail {
          font-size: 12px;
          margin-bottom: 2px;
        }
        .footer {
          margin-top: auto;
          border-top: 2px solid ${primaryColor};
          padding-top: 8px;
        }
        .footer-message {
          text-align: center;
          font-size: 11px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .footer-contact {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px;
          font-size: 11px;
          color: #374151;
        }
        .stamp {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-12deg);
          z-index: 10;
          pointer-events: none;
          opacity: 0.45;
        }
        .stamp-circle {
          border: 4px solid #dc2626;
          border-radius: 50%;
          width: 140px;
          height: 140px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          box-shadow: 0 3px 10px rgba(220, 38, 38, 0.3);
          padding: 8px;
        }
        .stamp-module {
          font-size: 10px;
          font-weight: bold;
          color: #dc2626;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .stamp-line {
          width: 70px;
          height: 1.5px;
          background-color: #dc2626;
          margin-bottom: 4px;
        }
        .stamp-paid {
          font-size: 24px;
          font-weight: 900;
          color: #dc2626;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
        .stamp-date {
          font-size: 8px;
          font-weight: 600;
          color: #dc2626;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
      </style>
    </head>
    <body style="position: relative;">
      ${document.type === 'receipt' ? `
        <div class="stamp">
          <div class="stamp-circle">
            <div class="stamp-module">${companyName}</div>
            <div class="stamp-line"></div>
            <div class="stamp-paid">PAID</div>
            <div class="stamp-date">${new Date(document.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
          </div>
        </div>
      ` : ''}
      
      <div class="header">
        <div class="company-info">
          <div>
            <div class="company-name">${companyName}</div>
            <div class="tagline">${kethuConsultTagline}</div>
            <div class="address">${kethuConsultAddress}</div>
            <div class="address">Tel: ${kethuConsultPhone} | Email: ${kethuConsultEmail}</div>
          </div>
        </div>
        <div class="document-title">
          <div class="title-text">${documentTitle}</div>
          ${document.type === 'receipt' ? '<div class="paid-badge">PAID</div>' : ''}
          <div class="document-number">${documentNumberLabel} : ${document.documentNumber}</div>
          <div class="date">${new Date(document.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div class="separator"></div>

      <div class="customer-section">
        <div class="customer-label">${documentToLabel} :</div>
        <div class="customer-name">${document.customerName}</div>
        ${document.customerPhone ? `<div class="customer-detail">${document.customerPhone}</div>` : ''}
        ${document.customerEmail ? `<div class="customer-detail">${document.customerEmail}</div>` : ''}
        ${document.customerAddress ? `<div class="customer-detail">${document.customerAddress}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: ${document.type === 'receipt' ? '4%' : '5%'};">NO</th>
            <th style="width: ${document.type === 'receipt' ? '38%' : '45%'};">DESCRIPTION</th>
            <th class="text-center" style="width: ${document.type === 'receipt' ? '10%' : '12%'};">QTY</th>
            <th class="text-right" style="width: ${document.type === 'receipt' ? '15%' : '18%'};">PRICE</th>
            <th class="text-right" style="width: ${document.type === 'receipt' ? '16%' : '20%'};">TOTAL</th>
            ${document.type === 'receipt' ? '<th class="text-right" style="width: 17%;">BALANCE</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${document.items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td class="description">${item.description}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right total">${formatCurrency(item.total)}</td>
              ${document.type === 'receipt' ? `<td class="text-right balance">${formatCurrency(0)}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-box">
          <div class="summary-row">
            <span class="summary-label">Sub Total :</span>
            <span class="summary-value">${formatCurrency(document.subtotal)}</span>
          </div>
          ${document.discount > 0 ? `
            <div class="summary-row" style="color: #dc2626;">
              <span style="color: #dc2626; font-weight: 500;">Discount (${document.discount}%) :</span>
              <span style="color: #dc2626; font-weight: 600;">-${formatCurrency((document.subtotal * document.discount) / 100)}</span>
            </div>
          ` : ''}
          ${document.taxRate > 0 ? `
            <div class="summary-row">
              <span class="summary-label">VAT ${document.taxRate}% :</span>
              <span class="summary-value">${formatCurrency(document.taxAmount)}</span>
            </div>
          ` : ''}
          <div class="grand-total">
            <span>GRAND TOTAL :</span>
            <span>${formatCurrency(document.total)}</span>
          </div>
        </div>
      </div>

      <div class="spacer"></div>

      <div class="payment-method">
        <div class="payment-title">PAYMENT METHOD :</div>
        <div class="payment-detail">Bank : Please contact us for bank details</div>
        <div class="payment-detail">Mobile Money : ${kethuConsultPhone}</div>
      </div>

      <div style="border-top: 1px solid #d1d5db; padding-top: 6px; margin-bottom: 6px;">
        <div style="font-size: 13px; color: #374151; font-weight: 500;">Thank you for business with us!</div>
      </div>

      <div style="margin-bottom: 6px;">
        <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 3px;">Term and Conditions :</div>
        <div style="font-size: 11px; color: #4b5563; line-height: 1.3;">
          ${document.notes || (document.type === 'invoice' ? 'Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice.' : '')}
        </div>
      </div>

      <div class="footer">
        <div class="footer-message">Be rest assured of the best service possible.</div>
        <div class="footer-contact">
          <span>📞 ${kethuConsultPhone}</span>
          <span>✉️ ${kethuConsultEmail}</span>
          <span>📍 ${kethuConsultAddress}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function generatePDFFromDocument(document, moduleName) {
  let browser;
  try {
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--single-process',
      ],
    };

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });
    
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-MW', {
        style: 'currency',
        currency: 'MWK',
      }).format(amount);
    };
    
    const html = generateDocumentHTML(document, moduleName, formatCurrency);
    
    await page.setContent(html, { 
      waitUntil: 'load',
      timeout: 30000,
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm',
      },
      preferCSSPageSize: false,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`PDF generation failed: ${error.message || 'Unknown error'}`);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

