const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const response = require('../responses');
const Order = mongoose.model("Order");

module.exports = {
  //   testInvoice: async (req, res) => {
  //     try {
  //       const doc = new PDFDocument({
  //         size: 'A4',
  //         margin: 50
  //       });

  //       res.setHeader('Content-Type', 'application/pdf');
  //       res.setHeader('Content-Disposition', 'attachment; filename=test-invoice.pdf');

  //       doc.pipe(res);

  //       doc.fontSize(32)
  //          .font('Helvetica-Bold')
  //          .fillColor('#1e3a8a')
  //          .text('INVOICE', 50, 50);

  //       doc.fontSize(16)
  //          .font('Helvetica')
  //          .fillColor('#000000')
  //          .text('Test Invoice Generated Successfully!', 50, 120)
  //          .text('Date: ' + new Date().toLocaleDateString(), 50, 150)
  //          .text('Order ID: TEST-001', 50, 180)
  //          .text('Customer: Test Customer', 50, 210)
  //          .text('Total: $100.00', 50, 240);

  //       // Finalize the PDF
  //       doc.end();

  //     } catch (error) {
  //       console.error('PDF Generation Error:', error);
  //       res.status(500).json({ error: 'PDF generation failed', details: error.message });
  //     }
  //   },

  generateOrdersInvoice: async (req, res) => {
    try {
      const { orderId } = req.query;

      const order =
        await Order.findById(orderId).populate('user instructer');
      if (!order) {
        return response.notFound(res, 'Order not found');
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=invoice-${order._id}.pdf`,
      );

      doc.pipe(res);
      const obj = {
        invoice_id: order.order_id,
        date: order?.sheduledate?order?.sheduledate:order.createdAt,
        selectedTime: order.selectedTime,
        company_name: 'Bodmass',
        company_address: '123 xyz Street',
        company_city: 'Toronto, ON M5V 3A8',
        customer_name: order?.name || 'Customer',
        customer_address: order.pickup_address || 'N/A',
        subtotal: Number(order.total) || 0,
        tax: order.service_fee || 0,
        //   delivery_fee: 0,
        total: Number(order.total) || 0,
        payment_mode: order.payment_mode || 'Online',
        //   status: order.status,
        pickup: order.pickup_address,
        instructer_name: order?.instructer?.name
          ? order?.instructer?.name
          : null,
        vehicle_info: order?.instructer?.vehicle_model
          ? order?.instructer?.vehicle_model
          : null,
      };
      generateOrdersInvoiceContent(doc, obj);
      // Finalize the PDF
      doc.end();
    } catch (error) {
      return response.error(res, error);
    }
  },
};
function generateOrdersInvoiceContent(doc, data) {
  // Colors
  const darkBlue = '#1e3a8a';
  const red = '#dc2626';
  const blue = '#4EB0CF';
  const black = '#000000';
  const gray = '#6b7280';

  // Header Title
  doc
    .fontSize(32)
    .font('Helvetica-Bold')
    .fillColor(darkBlue)
    .text('INVOICE', 50, 50);

  // Company Info (Left)
  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor(black)
    .text(data.company_name || 'Your App Name', 50, 100)
    .text(data.company_address || 'Company Address', 50, 115)
    .text(data.company_city || 'City, Country', 50, 130);

  // Logo (Right)
  try {
    const logoPath = path.join(__dirname, '../../public/images/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 490, 25, { width: 80, height: 80 });
    } else {
      doc
        .circle(520, 65, 40)
        .fillColor('#f3f4f6')
        .fill()
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor(gray)
        .text('LOGO', 505, 60);
    }
  } catch {
    doc
      .circle(520, 65, 40)
      .fillColor('#f3f4f6')
      .fill()
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(gray)
      .text('LOGO', 505, 60);
  }

  // Invoice Meta (Right)
  const rightX = 320;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(darkBlue)
    .text('INVOICE #', rightX - 30, 120)
    .text('SESSION DATE', rightX - 30, 140);

  doc
    .font('Helvetica')
    .fontSize(12)
    .fillColor(black)
      .text(data.invoice_id || 'N/A', rightX + 70, 120)
    .text(
      data.date
        ? new Date(data.date).toLocaleDateString() + ' ' + data?.selectedTime
        : 'N/A',
      rightX + 70,
      140,
    );

  // Address/Trip Info
  const addressY = 200;

  // BILL TO (User Info)
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(darkBlue)
    .text('BILL TO', 50, addressY);

  doc
    .font('Helvetica')
    .fillColor(black)
    .text(data.customer_name || 'N/A', 50, addressY + 15)
    .text(data.customer_address || 'N/A', 50, addressY + 30, { width: 200 });
  //   .text(data.customer_city || 'N/A', 50, addressY + 45, { width: 270 });

  // SHIP TO → Change to "TRIP DETAILS"
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(darkBlue)
    .text('SESSION DETAILS', 320, addressY);

  doc
    .font('Helvetica')
    .fillColor(black)
    .text(`From: ${data.pickup || 'N/A'}`, 320, addressY + 15);
  //   .text(`To: ${data.drop || 'N/A'}`, 320, addressY + 60)
  //   .text(`Time: ${data.time || 'N/A'}`, 320, addressY + 45);

  // Blue separator
  doc
    .moveTo(50, addressY + 110)
    .lineTo(550, addressY + 110)
    .strokeColor(blue)
    .lineWidth(1)
    .stroke();

  // Table Header
  const tableY = addressY + 120;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(black)
    .text('DESCRIPTION', 50, tableY)
    .text('AMOUNT', 450, tableY);

  doc
    .moveTo(50, tableY + 20)
    .lineTo(550, tableY + 20)
    .strokeColor(blue)
    .lineWidth(1)
    .stroke();

  // Table Content
  let currentY = tableY + 30;
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(black)
    .text('Base Fare', 50, currentY)
    .text(`KR${data.subtotal?.toFixed(2) || '0.00'}`, 450, currentY);

  //   currentY += 20;
  //   doc.text('Distance Fare', 50, currentY)
  //      .text(`KR${data.distance_fare?.toFixed(2) || '0.00'}`, 450, currentY);

  //   currentY += 20;
  //   doc.text('Time Fare', 50, currentY)
  //      .text(`KR${data.time_fare?.toFixed(2) || '0.00'}`, 450, currentY);

  currentY += 20;
  doc
    .text('Tax (0%)', 50, currentY)
    .text(`KR${data.tax?.toFixed(2) || '0.00'}`, 450, currentY);

  //   if (data.tip && data.tip > 0) {
  //     currentY += 20;
  //     doc.text('Tip', 50, currentY)
  //        .text(`KR${data.tip.toFixed(2)}`, 450, currentY);
  //   }

  // Total Fare
  currentY += 30;
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('TOTAL', 50, currentY)
    .text(`KR${data.total?.toFixed(2) || '0.00'}`, 450, currentY);

  // Instructer Section
  currentY += 40;
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(darkBlue)
    .text('Instructer INFO', 50, currentY);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(black)
    .text(
      `Instructer Name: ${data.instructer_name || 'N/A'}`,
      50,
      currentY + 15,
    )
    .text(`Vehicle: ${data.vehicle_info || 'N/A'}`, 50, currentY + 30);

  // Footer
  const footerY = 700;
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .fillColor(darkBlue)
    .text('Thank you', 50, footerY);

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor(black)
    .text('Amiri', 350, footerY);

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(black)
    .text('BokaKorning', 350, footerY + 20);
}
