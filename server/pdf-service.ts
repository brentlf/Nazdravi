import jsPDF from 'jspdf';
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
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(165, 203, 164); // Brand green color
    doc.text('🌿 Vee Nutrition', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Transforming Lives Through Nutrition', 20, 40);
    doc.text('Email: info@veenutrition.com', 20, 50);
    
    // Invoice title
    doc.setFontSize(20);
    doc.setTextColor(51, 51, 51);
    const title = data.invoiceType === 'credit' ? 'CREDIT NOTE' : 'INVOICE';
    doc.text(title, 150, 30);
    
    // Invoice details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${title} #: ${data.invoiceNumber}`, 150, 45);
    doc.text(`Date: ${data.createdAt.toLocaleDateString()}`, 150, 55);
    if (data.invoiceType !== 'credit') {
      doc.text(`Due Date: ${data.dueDate.toLocaleDateString()}`, 150, 65);
      doc.text(`Status: ${data.status.toUpperCase()}`, 150, 75);
    }
    
    // Client information
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('Bill To:', 20, 80);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(data.clientName, 20, 95);
    doc.text(data.clientEmail, 20, 105);
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 120, 190, 120);
    
    // Items/Services header
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Description', 20, 135);
    doc.text('Amount', 150, 135);
    
    doc.setLineWidth(0.3);
    doc.line(20, 140, 190, 140);
    
    // Items
    let yPosition = 155;
    doc.setTextColor(0, 0, 0);
    
    if (data.items && data.items.length > 0) {
      data.items.forEach((item) => {
        doc.text(item.description, 20, yPosition);
        doc.text(`${data.currency}${item.amount.toFixed(2)}`, 150, yPosition);
        yPosition += 15;
      });
    } else {
      doc.text(data.description, 20, yPosition);
      doc.text(`${data.currency}${Math.abs(data.amount).toFixed(2)}`, 150, yPosition);
      yPosition += 15;
    }
    
    // Total line
    doc.setLineWidth(0.3);
    doc.line(130, yPosition + 5, 190, yPosition + 5);
    
    // Total amount
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    const totalLabel = data.invoiceType === 'credit' ? 'Credit Amount:' : 'Total Amount:';
    doc.text(totalLabel, 130, yPosition + 20);
    doc.text(`${data.currency}${Math.abs(data.amount).toFixed(2)}`, 150, yPosition + 20);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.text('Thank you for choosing Vee Nutrition!', 20, yPosition + 50);
    
    if (data.invoiceType !== 'credit') {
      doc.text('Payment is due within 14 days of invoice date.', 20, yPosition + 60);
    }
    
    // Return PDF as buffer
    const pdfOutput = doc.output('arraybuffer');
    return Buffer.from(pdfOutput);
  }
  
  async uploadPDFToStorage(
    pdfBuffer: Buffer, 
    fileName: string, 
    folder: string = 'invoices'
  ): Promise<string> {
    try {
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
      
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading PDF to Firebase Storage:', error);
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