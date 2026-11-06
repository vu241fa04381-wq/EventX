const PDFDocument = require('pdfkit');

/**
 * Generate a PDF Certificate buffer
 * @param {Object} data - { certificateId, recipientName, eventTitle, eventDate, organizerName, verificationCode }
 * @returns {Promise<Buffer>}
 */
const generateCertificatePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      // Landscape A4: 841.89 x 595.28
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      const width = doc.page.width;
      const height = doc.page.height;

      // Outer Decorative Border
      doc.rect(20, 20, width - 40, height - 40)
        .lineWidth(3)
        .strokeColor('#5146E5')
        .stroke();

      // Inner Accent Border
      doc.rect(28, 28, width - 56, height - 56)
        .lineWidth(1)
        .strokeColor('#C7D2FE')
        .stroke();

      // Header Brand
      doc.fontSize(16)
        .fillColor('#5146E5')
        .text('EVENTX PLATFORM', 0, 60, { align: 'center', characterSpacing: 3 });

      // Certificate Title
      doc.fontSize(32)
        .fillColor('#111827')
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF PARTICIPATION', 0, 95, { align: 'center' });

      doc.moveDown(0.3);
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#64748B')
        .text('THIS IS PROUDLY PRESENTED TO', { align: 'center', characterSpacing: 1.5 });

      // Recipient Name
      doc.moveDown(0.8);
      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#1E1B4B')
        .text(data.recipientName.toUpperCase(), { align: 'center' });

      // Divider Line below name
      const nameWidth = 400;
      doc.moveTo((width - nameWidth) / 2, 235)
        .lineTo((width + nameWidth) / 2, 235)
        .lineWidth(1.5)
        .strokeColor('#8B5CF6')
        .stroke();

      // Body Text
      doc.fontSize(13)
        .font('Helvetica')
        .fillColor('#475569')
        .text(
          `for actively participating in and successfully completing the event`,
          0,
          255,
          { align: 'center' }
        );

      // Event Title
      doc.moveDown(0.4);
      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#5146E5')
        .text(`"${data.eventTitle}"`, { align: 'center' });

      // Event Date & Details
      const formattedDate = new Date(data.eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.moveDown(0.4);
      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#64748B')
        .text(`Held on ${formattedDate}`, { align: 'center' });

      // Bottom Section: Signatures & Verification
      const bottomY = height - 130;

      // Left: Organizer / Institution Signatory
      doc.moveTo(80, bottomY + 30)
        .lineTo(260, bottomY + 30)
        .lineWidth(1)
        .strokeColor('#94A3B8')
        .stroke();

      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#1E293B')
        .text(data.organizerName, 80, bottomY + 38, { width: 180, align: 'center' });
      doc.fontSize(9)
        .font('Helvetica')
        .fillColor('#64748B')
        .text('Event Organizer / Convener', 80, bottomY + 52, { width: 180, align: 'center' });

      // Center: Official Seal / Badge
      doc.circle(width / 2, bottomY + 25, 28)
        .lineWidth(2)
        .strokeColor('#5146E5')
        .stroke();
      doc.fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#5146E5')
        .text('OFFICIAL', (width / 2) - 25, bottomY + 15, { width: 50, align: 'center' });
      doc.text('VERIFIED', (width / 2) - 25, bottomY + 27, { width: 50, align: 'center' });

      // Right: Certificate ID & Verification
      doc.moveTo(width - 260, bottomY + 30)
        .lineTo(width - 80, bottomY + 30)
        .lineWidth(1)
        .strokeColor('#94A3B8')
        .stroke();

      doc.fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#1E293B')
        .text(`ID: ${data.certificateId}`, width - 260, bottomY + 38, { width: 180, align: 'center' });
      doc.fontSize(8)
        .font('Helvetica')
        .fillColor('#64748B')
        .text(`Code: ${data.verificationCode}`, width - 260, bottomY + 52, { width: 180, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateCertificatePDF };
