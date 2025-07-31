const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html) => {
  // Path to the logo
  const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png');

  try {
    // Read the image file and convert it to base64
    const logoAttachment = fs.readFileSync(logoPath).toString('base64');

    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      text, // Fallback for clients that don't support HTML
      html,
      attachments: [
        {
          content: logoAttachment,
          filename: 'logo.png',
          type: 'image/png',
          disposition: 'inline',
          content_id: 'logo' // This ID is referenced in the HTML `<img>` tag
        }
      ]
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};

module.exports = { sendEmail };
