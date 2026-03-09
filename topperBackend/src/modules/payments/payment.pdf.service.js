const PDFDocument = require('pdfkit');
const Order = require('../orders/order.model');
const Note = require('../notes/notes.model');
const User = require('../users/user.model');

exports.generateCustomerDocument = async (orderId, type, res) => {
  const order = await Order.findById(orderId)
    .populate('noteId', 'subject chapterName class board price')
    .populate('topperId', 'name email address')
    .populate('studentId', 'name email');

  if (!order) {
    throw new Error('Order not found');
  }

  // Create a document
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=${type}-${orderId}.pdf`
  );

  doc.pipe(res);

  // Header Title
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text(type === 'invoice' ? 'TAX INVOICE' : 'PAYMENT RECEIPT', { align: 'center' });

  doc.moveDown();
  
  // Date and IDs
  doc.fontSize(10).font('Helvetica-Bold').text(`Order ID: `, { continued: true }).font('Helvetica').text(order._id.toString());
  doc.font('Helvetica-Bold').text(`Date: `, { continued: true }).font('Helvetica').text(new Date(order.createdAt).toLocaleDateString());
  doc.font('Helvetica-Bold').text(`Status: `, { continued: true }).font('Helvetica').text(order.paymentStatus);
  if (order.razorpayPaymentId) {
    doc.font('Helvetica-Bold').text(`Transaction ID: `, { continued: true }).font('Helvetica').text(order.razorpayPaymentId);
  }
  
  doc.moveDown(2);

  const customerName = order.studentId?.name || 'Student';
  const sellerName = order.topperId?.name || 'Topper';

  // Addresses
  doc.font('Helvetica-Bold').text('Billed To:', 50, 150);
  doc.font('Helvetica').text(customerName, 50, 165);
  doc.text(order.studentId?.email || 'N/A', 50, 180);

  doc.font('Helvetica-Bold').text('Seller Information:', 300, 150);
  doc.font('Helvetica').text(sellerName, 300, 165);
  doc.text('ToppersNote Platform', 300, 180);

  doc.moveDown(3);

  // Table Header
  const tableTop = 250;
  
  doc.font('Helvetica-Bold');
  doc.text('Item', 50, tableTop);
  doc.text('Description', 200, tableTop);
  doc.text('Amount', 450, tableTop, { width: 90, align: 'right' });

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Table Content
  let y = tableTop + 25;
  doc.font('Helvetica');
  doc.text(order.noteId ? `${order.noteId.subject} Notes` : 'Deleted Note', 50, y);
  doc.text(order.noteId ? `Chapter: ${order.noteId.chapterName}` : 'N/A', 200, y);
  
  const priceText = `Rs. ${order.amountPaid.toFixed(2)}`;
  doc.text(priceText, 450, y, { width: 90, align: 'right' });

  doc.moveTo(50, y + 20).lineTo(550, y + 20).stroke();

  // Total
  const totalTop = y + 40;
  doc.font('Helvetica-Bold');
  doc.text('Total Amount', 300, totalTop, { width: 90, align: 'right' });
  doc.text(priceText, 450, totalTop, { width: 90, align: 'right' });

  // Footer Message
  if (type === 'invoice') {
    doc.fontSize(10).font('Helvetica').text('Thank you for purchasing notes on ToppersNote!', 50, 700, { align: 'center', width: 500 });
  } else {
    doc.fontSize(10).font('Helvetica').text('Payment Receipt generated automatically.', 50, 700, { align: 'center', width: 500 });
  }

  doc.end();
};
