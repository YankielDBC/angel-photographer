const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'yankielkahel@gmail.com', pass: 'mlzynhzpqdgjchww' }
  });
  try {
    await transporter.sendMail({
      from: '"Test" <yankielkahel@gmail.com>',
      to: 'yankielkahel@gmail.com',
      subject: 'Test',
      text: 'Test'
    });
    console.log('SUCCESS!');
  } catch(e) {
    console.log('Error:', e.message);
  }
}

test();
