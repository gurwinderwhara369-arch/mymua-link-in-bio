const nodemailer = require('nodemailer');
const config = require('./env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
    console.log('SMTP not configured — emails disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return transporter;
}

async function sendBookingNotification(muaEmail, muaName, booking) {
  const t = getTransporter();
  if (!t) return;
  await t.sendMail({
    from: config.smtp.from,
    to: muaEmail,
    subject: `New Booking Inquiry — ${booking.name}`,
    html: `<div style="font-family:sans-serif;max-width:500px">
      <h2>New Booking Request</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      ${booking.email ? `<p><strong>Email:</strong> ${booking.email}</p>` : ''}
      ${booking.service ? `<p><strong>Service:</strong> ${booking.service}</p>` : ''}
      ${booking.event_date ? `<p><strong>Event Date:</strong> ${booking.event_date}</p>` : ''}
      ${booking.location ? `<p><strong>Location:</strong> ${booking.location}</p>` : ''}
      ${booking.guests ? `<p><strong>Guests:</strong> ${booking.guests}</p>` : ''}
      ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
      <hr><p style="color:#888;font-size:12px">Sent from your Mymua brochure page</p>
    </div>`,
  });
}

module.exports = { getTransporter, sendBookingNotification };
