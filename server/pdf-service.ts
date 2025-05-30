import PDFDocument from 'pdfkit';
import { storage } from './firebase';

export interface InvoicePDFData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  currency: string;
  description: string;
  invoiceType: 'invoice' | 'credit';
  createdAt: Date;
  dueDate: Date;
  status: string;
  items?: Array<{
    description: string;
    amount: number;
  }>;
}

export class PDFService {
  
  async generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
    console.log('📄 Starting PDF generation for:', data.invoiceNumber);
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      // Collect PDF data
      doc.on('data', (chunk) => chunks.push(chunk));
      
      return new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log('📄 PDF generated successfully, size:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });
        
        doc.on('error', reject);
        
        // Header
        doc.fontSize(24)
           .fillColor('#A5CBA4')
           .text('🌿 Vee Nutrition', 50, 50);
        
        doc.fontSize(12)
           .fillColor('#000000')
           .text('Transforming Lives Through Nutrition', 50, 80)
           .text('Email: info@veenutrition.com', 50, 95);
        
        // Invoice title
        const title = data.invoiceType === 'credit' ? 'CREDIT NOTE' : 'INVOICE';
        doc.fontSize(20)
           .fillColor('#333333')
           .text(title, 400, 50);
        
        // Invoice details
        doc.fontSize(12)
           .fillColor('#000000')
           .text(`${title} #: ${data.invoiceNumber}`, 400, 80)
           .text(`Date: ${data.createdAt.toLocaleDateString()}`, 400, 95);
        
        if (data.invoiceType !== 'credit') {
          doc.text(`Due Date: ${data.dueDate.toLocaleDateString()}`, 400, 110)
             .text(`Status: ${data.status.toUpperCase()}`, 400, 125);
        }
        
        // Client information
        doc.fontSize(14)
           .fillColor('#333333')
           .text('Bill To:', 50, 150);
        
        doc.fontSize(12)
           .fillColor('#000000')
           .text(data.clientName, 50, 175)
           .text(data.clientEmail, 50, 190);
        
        // Line separator
        doc.moveTo(50, 220)
           .lineTo(550, 220)
           .stroke();
        
        // Items/Services header
        doc.fontSize(12)
           .fillColor('#333333')
           .text('Description', 50, 240)
           .text('Amount', 450, 240);
        
        // Items line
        doc.moveTo(50, 255)
           .lineTo(550, 255)
           .stroke();
        
        // Items
        let yPosition = 275;
        doc.fillColor('#000000');
        
        if (data.items && data.items.length > 0) {
          data.items.forEach((item) => {
            doc.text(item.description, 50, yPosition)
               .text(`${data.currency}${item.amount.toFixed(2)}`, 450, yPosition);
            yPosition += 20;
          });
        } else {
          doc.text(data.description, 50, yPosition)
             .text(`${data.currency}${Math.abs(data.amount).toFixed(2)}`, 450, yPosition);
          yPosition += 20;
        }
        
        // Total line
        doc.moveTo(350, yPosition + 10)
           .lineTo(550, yPosition + 10)
           .stroke();
        
        // Total amount
        const totalLabel = data.invoiceType === 'credit' ? 'Credit Amount:' : 'Total Amount:';
        doc.fontSize(14)
           .fillColor('#333333')
           .text(totalLabel, 350, yPosition + 25)
           .text(`${data.currency}${Math.abs(data.amount).toFixed(2)}`, 450, yPosition + 25);
        
        // Footer
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Thank you for choosing Vee Nutrition!', 50, yPosition + 70);
        
        if (data.invoiceType !== 'credit') {
          doc.text('Payment is due within 14 days of invoice date.', 50, yPosition + 85);
        }
        
        doc.end();
      });
    } catch (error) {
      console.error('📄 Error in PDF generation:', error);
      throw error;
    }
  }
  
  async uploadPDFToStorage(
    pdfBuffer: Buffer, 
    fileName: string, 
    folder: string = 'invoices'
  ): Promise<string> {
    try {
      console.log('📤 Uploading PDF to Firebase Storage:', fileName);
      const bucket = storage.bucket();
      const file = bucket.file(`${folder}/${fileName}`);
      
      await file.save(pdfBuffer, {
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
      });
      
      // Get download URL
      const [downloadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future expiration
      });
      
      console.log('✅ PDF uploaded successfully:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('❌ Error uploading PDF to Firebase Storage:', error);
      throw error;
    }
  }
  
  async generateAndStorePDF(data: InvoicePDFData): Promise<string> {
    try {
      // Generate PDF
      const pdfBuffer = await this.generateInvoicePDF(data);
      
      // Create filename
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${data.invoiceNumber}_${timestamp}.pdf`;
      
      // Upload to Firebase Storage
      const downloadUrl = await this.uploadPDFToStorage(pdfBuffer, fileName);
      
      console.log(`📄 PDF generated and stored: ${fileName}`);
      return downloadUrl;
    } catch (error) {
      console.error('Error generating and storing PDF:', error);
      throw error;
    }
  }
}

export const pdfService = new PDFService();