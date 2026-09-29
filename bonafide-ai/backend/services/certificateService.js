const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (applicationData, certificateId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const certificatesDir = path.join(__dirname, '..', 'certificates');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const fileName = `${certificateId}.pdf`;
      const filePath = path.join(certificatesDir, fileName);
      const verificationUrl = `http://localhost:5000/api/certificates/verify/${certificateId}`;

      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 120,
        margin: 1
      });

      const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');
      const qrTempPath = path.join(certificatesDir, `${certificateId}_qr.png`);
      fs.writeFileSync(qrTempPath, qrBuffer);

      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 50,
          bottom: 50,
          left: 72,
          right: 72
        }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      doc.rect(0, 0, doc.page.width, 80).fill('#1a3a5c');
      doc.rect(0, 80, doc.page.width, 4).fill('#c9a227');

      doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold')
        .text('GOVERNMENT COLLEGE OF TECHNOLOGY', 0, 25, {
          align: 'center',
          width: doc.page.width
        });

      doc.fontSize(12).fillColor('#ffffff').font('Helvetica')
        .text('Affiliated to Anna University | Accredited with A+ Grade', 0, 58, {
          align: 'center',
          width: doc.page.width
        });

      doc.fontSize(32).fillColor('#1a3a5c').font('Helvetica-Bold')
        .text('BONAFIDE CERTIFICATE', 0, 110, {
          align: 'center',
          width: doc.page.width
        });

      doc.moveTo(250, 145).lineTo(550, 145).lineWidth(1).stroke('#c9a227');

      const certInfoY = 165;
      doc.fontSize(14).fillColor('#333333').font('Helvetica-Bold')
        .text(`Certificate No: ${certificateId}`, 72, certInfoY);

      doc.fontSize(12).fillColor('#666666').font('Helvetica')
        .text(`Date of Issue: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 72, certInfoY + 22);

      const bodyY = 215;
      doc.fontSize(13).fillColor('#333333').font('Helvetica')
        .text('This is to certify that', 72, bodyY, { align: 'center', width: doc.page.width - 144 });

      doc.fontSize(20).fillColor('#1a3a5c').font('Helvetica-Bold')
        .text(applicationData.studentName.toUpperCase(), 72, bodyY + 28, {
          align: 'center',
          width: doc.page.width - 144
        });

      doc.fontSize(13).fillColor('#333333').font('Helvetica')
        .text(`Register Number: ${applicationData.registerNumber}`, 72, bodyY + 60, {
          align: 'center',
          width: doc.page.width - 144
        });

      doc.fontSize(13).fillColor('#333333').font('Helvetica')
        .text(
          `is a bonafide student of this institution, studying ${applicationData.course} in ${applicationData.department},`,
          72, bodyY + 85,
          { align: 'center', width: doc.page.width - 144 }
        );

      doc.fontSize(13).fillColor('#333333').font('Helvetica')
        .text(
          `Year ${applicationData.year}, Semester ${applicationData.semester}.`,
          72, bodyY + 108,
          { align: 'center', width: doc.page.width - 144 }
        );

      doc.fontSize(13).fillColor('#333333').font('Helvetica')
        .text(
          `This certificate is issued for the purpose of: ${applicationData.purpose}.`,
          72, bodyY + 140,
          { align: 'center', width: doc.page.width - 144 }
        );

      doc.fontSize(11).fillColor('#666666').font('Helvetica-Oblique')
        .text(
          'This certificate is computer generated and does not require a physical signature.',
          72, bodyY + 175,
          { align: 'center', width: doc.page.width - 144 }
        );

      doc.image(qrTempPath, doc.page.width - 160, bodyY + 60, {
        width: 100,
        height: 100
      });

      doc.fontSize(9).fillColor('#666666').font('Helvetica')
        .text('Scan to verify', doc.page.width - 160, bodyY + 165, {
          width: 100,
          align: 'center'
        });

      doc.fontSize(9).fillColor('#999999').font('Helvetica')
        .text(`Verification URL: ${verificationUrl}`, 72, bodyY + 200, {
          align: 'center',
          width: doc.page.width - 144
        });

      doc.rect(0, doc.page.height - 70, doc.page.width, 4).fill('#c9a227');
      doc.rect(0, doc.page.height - 66, doc.page.width, 66).fill('#1a3a5c');

      doc.fontSize(10).fillColor('#ffffff').font('Helvetica')
        .text('Government College of Technology, Coimbatore - 641013', 0, doc.page.height - 55, {
          align: 'center',
          width: doc.page.width
        });

      doc.fontSize(9).fillColor('#cccccc').font('Helvetica')
        .text('Phone: +91-422-2301045 | Email: principal@gct.ac.in', 0, doc.page.height - 38, {
          align: 'center',
          width: doc.page.width
        });

      doc.end();

      writeStream.on('finish', () => {
        try {
          fs.unlinkSync(qrTempPath);
        } catch (e) {
          // ignore cleanup error
        }
        resolve({
          certificateId,
          filePath,
          fileName,
          verificationUrl
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };