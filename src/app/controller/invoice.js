const mongoose = require("mongoose");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const response = require("../responses");
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

//   generateInvoice: async (req, res) => {
//     try {
//       // Get data from query parameters for browser access - YOUR DATA FIELDS
//       const payload = {
//         // Invoice Details
//         order_id: req.query.order_id || req.body?.order_id || 'N/A',
//         order_date: req.query.order_date || req.body?.order_date || new Date().toISOString(),
//         due_date: req.query.due_date || req.body?.due_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        
//         // Company Details (Your Business)
//         company_name: req.query.company_name || req.body?.company_name || 'N/A',
//         company_address: req.query.company_address || req.body?.company_address || 'N/A',
//         company_city: req.query.company_city || req.body?.company_city || 'N/A',
        
//         // Customer Details
//         customer_name: req.query.customer_name || req.body?.customer_name || 'N/A',
//         customer_address: req.query.customer_address || req.body?.customer_address || 'N/A',
//         customer_city: req.query.customer_city || req.body?.customer_city || 'N/A',
        
//         // Order Items (Your Food/Ride Data)
//         items: req.body?.items || [
//           {
//             qty: 0,
//             description: 'N/A',
//             unit_price: 0,
//             amount: 0
//           }
//         ],
        
//         // Financial Details (Your Order Data)
//         subtotal: parseFloat(req.query.subtotal || req.body?.subtotal || 0),
//         tax: parseFloat(req.query.tax || req.body?.tax || 0),
//         delivery_fee: parseFloat(req.query.delivery_fee || req.body?.delivery_fee || 0),
//         total: parseFloat(req.query.total || req.body?.total || 0),
        
      
//         payment_mode: req.query.payment_mode || req.body?.payment_mode || 'N/A',
//         status: req.query.status || req.body?.status || 'N/A'
//       };
      
//       const doc = new PDFDocument({
//         size: 'A4',
//         margin: 50
//       });

//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', `attachment; filename=invoice-${payload.order_id}.pdf`);

//       doc.pipe(res);

//       generateInvoiceContent(doc, payload);

//       doc.end();

//     } catch (error) {
//       console.error('PDF Generation Error:', error);
//       res.status(500).json({ error: 'PDF generation failed', details: error.message });
//     }
//   },

  generateInvoice: async (req, res) => {
    try {
      const { orderId,lang } = req.query;
        const order = await Order.findById(orderId)
          .populate("user vendor product");
        
      if (!order) {
        return response.notFound(res, "Order not found");
      }
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);

      doc.pipe(res);
      const obj={
        order_id: order.order_id,
        order_date: order?.sheduledate?order?.sheduledate:order.createdAt,
        selectedTime: order.selectedSlot,
        company_name: "Bodmass",
        company_address: "123 Street",
        company_city: "Toronto, ON M5V 3A8",
        customer_name: order.user?.username || "Customer",
        customer_address: order?.user?.shipping_address?.address || "N/A",
        customer_city: order?.user?.shipping_address?.city || "N/A",
        items:[{
          qty: `${order.inputvalue} ${order.selectedAtribute?.unit || ''}`,
          product: order?.product?.name || 'N/A',
          description: order?.selectedAtribute?.name || 'N/A',
          unit_price: order?.selectedAtribute?.price || 'N/A',
          amount: order.price,
        }],
        subtotal: Number(order.price),
        tax: Number(order.tax),
        delivery_fee: Number(order.deliveryfee),
        // discount: order?.discount,
        total: Number(order.total),
      //   payment_mode: order.paymentmode,
        status: order.status
      }
      //  lang == 'en' ? generateInvoiceContent(doc,obj ) : generateInvoiceContent(doc,obj );
       generateInvoiceContent(doc,obj );
      
      doc.end();

    } catch (error) {
      return response.error(res, error);
    }
  },
}
// Helper function to generate invoice content - EXACT UI REPLICA
function generateInvoiceContent(doc, data) {
  // Colors - Exact match from UI
  const darkBlue = '#1e3a8a';
  const red = '#dc2626';
  const black = '#000000';
  const gray = '#6b7280';

  // Header Section - EXACT REPLICA
  doc.fontSize(32)
     .font('Helvetica-Bold')
     .fillColor(darkBlue)
     .text('INVOICE', 50, 50);

  // Company Info (Left) - EXACT POSITIONING
//   doc.fontSize(12)
//      .font('Helvetica')
//      .fillColor(black)
//      .text(data.company_name || 'N/A', 50, 100)
//      .text(data.company_address || 'N/A', 50, 115)
//      .text(data.company_city || 'N/A', 50, 130);

      try {
      const logoPath = path.join(__dirname, '../../../public/images/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 420, 25, { width: 160, height: 80 });
      } else {
        
        doc.circle(520, 65, 40)
           .fillColor('#f3f4f6')
           .fill()
           .fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(gray)
           .text('LOGO', 505, 60);
      }
    } catch (error) {
      // Fallback to placeholder if error
      doc.circle(520, 65, 40)
         .fillColor('#f3f4f6')
         .fill()
         .fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(gray)
         .text('LOGO', 505, 60);
    }

  // Invoice Details (Right) - EXACT LAYOUT
  const rightX = 350;
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(darkBlue);

  doc.text('INVOICE #', rightX-30, 110)
     .text('INVOICE DATE', rightX-30, 140)
   //   .text('P.O.#', rightX, 140)
   //   .text('DUE DATE', rightX, 160);

  doc.font('Helvetica')
     .fontSize(10)
     .fillColor(black)
     .text(data.order_id || 'N/A', rightX + 60, 110)
     .text(data.order_date ? new Date(data.order_date).toLocaleDateString() : 'N/A', rightX + 60, 140)
   //   .text(data.order_id || 'N/A', rightX + 100, 140)
   //   .text(data.due_date ? new Date(data.due_date).toLocaleDateString() : 'N/A', rightX + 100, 160);

  // Address Sections - EXACT POSITIONING
  const addressY = 200;
  
  // BILL TO - EXACT MATCH
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(darkBlue)
     .text('BILL TO', 50, addressY);

  doc.font('Helvetica')
     .fillColor(black)
     .text(data.customer_name || 'N/A', 50, addressY + 15)
     .text(data.customer_address || 'N/A', 50, addressY + 30,{
     width: 270
   })
     .text(data.customer_city || 'N/A', 50, addressY + 55);

  // SHIP TO - EXACT MATCH
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(darkBlue)
     .text('SHIP TO', 320, addressY);

  doc.font('Helvetica')
     .fillColor(black)
     .text(data.customer_name || 'N/A', 320, addressY + 15)
     .text(data.customer_address || 'N/A', 320, addressY + 30)
     .text(data.customer_city || 'N/A', 320, addressY + 55);

  // Red line separator - EXACT POSITIONING
  doc.moveTo(50, addressY + 80)
     .lineTo(550, addressY + 80)
     .strokeColor('#C68E27')
     .lineWidth(1)
     .stroke();

  // Table Headers - EXACT MATCH
  const tableY = addressY + 90;
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor(black)
     .text('QTY', 50, tableY)
     .text('PRODUCT', 120, tableY)
     .text('DESCRIPTION', 230, tableY)
     .text('AMOUNT', 350, tableY)
     .text('TOTAL', 450, tableY);

  // Red line under headers - EXACT MATCH
  doc.moveTo(50, tableY + 20)
     .lineTo(550, tableY + 20)
     .strokeColor('#C68E27')
     .lineWidth(1)
     .stroke();

  // Table Items - EXACT DATA FROM UI
  let currentY = tableY + 30;
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(black);

  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      doc.text((item.qty || 0).toString(), 50, currentY)
         .text(item.product || 'N/A', 120, currentY)
         .text(item.description || 'N/A', 230, currentY)
         .text(`CA$${(Number(item.unit_price) || 0).toFixed(2)}`, 350, currentY)
         .text(`CA$${(Number(item.amount) || 0).toFixed(2)}`, 450, currentY);
      
      currentY += 20;
    });
  } else {
    // Default items when no data
    doc.text('0', 50, currentY)
       .text('N/A', 120, currentY)
       .text('CA$0.00', 350, currentY)
       .text('CA$0.00', 450, currentY);
    currentY += 20;
  }

  // Summary Section (Right aligned) - EXACT MATCH
  const summaryY = currentY + 20;
  const summaryX = 350;

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(black)
     .text('Subtotal', summaryX, summaryY)
     .text(`CA$${(data.subtotal || 0).toFixed(2)}`, summaryX + 100, summaryY);

  doc.text(`Tax 5%`, summaryX, summaryY + 15)
     .text(`CA$${(data.tax || 0)}`, summaryX + 100, summaryY + 15);

  if (data.delivery_fee && data.delivery_fee > 0) {
    doc.text('Delivery Fee & Tip', summaryX, summaryY + 30)
       .text(`CA$${data.delivery_fee.toFixed(2)}`, summaryX + 100, summaryY + 30);
  }
  if (data.discount && data.discount > 0) {
    doc.text('Discount', summaryX, summaryY + 45)
       .text(`CA$${data.discount.toFixed(2)}`, summaryX + 100, summaryY + 30);
  }

  // Total - EXACT MATCH
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('TOTAL', summaryX, summaryY + 70)
     .text(`CA$${(data.total || 0).toFixed(2)}`, summaryX + 100, summaryY + 70);

  // Signature Area - EXACT MATCH
//   doc.fontSize(12)
//      .font('Helvetica')
//      .fillColor(black)
//      .text('John Smith', summaryX, summaryY + 80);

  // Footer - EXACT MATCH
  const footerY = 700;
  
  // Thank you message (Left) - EXACT SCRIPT FONT
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor(darkBlue)
     .text('Thank you', 50, footerY);

  // Terms & Conditions (Right) - EXACT MATCH
//   doc.fontSize(12)
//      .font('Helvetica-Bold')
//      .fillColor(black)
//      .text('Keba Coly', 350, footerY);

  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(black)
     .text('Bodmass', 350, footerY + 20)
   //   .text('Payment is due within 15 days', 350, footerY + 20)
   //   .text('Please make checks payable to: East Repair Inc.', 350, footerY + 35);
}
