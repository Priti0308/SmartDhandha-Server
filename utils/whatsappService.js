const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_NUMBER;

const client = new twilio(accountSid, authToken);

/**
 * Sends a WhatsApp message.
 * @param {string} to - The recipient's phone number with country code (e.g., +919876543210).
 * @param {string} body - The message content.
 * @returns {Promise<{success: boolean, sid?: string, error?: string}>}
 */
const sendWhatsappMessage = async (to, body) => {
  try {
    // Twilio requires the number in E.164 format prefixed with 'whatsapp:'
    const formattedTo = `whatsapp:${to}`;

    const message = await client.messages.create({
      body: body,
      from: from,
      to: formattedTo,
    });

    console.log(`WhatsApp message sent to ${to}. SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendWhatsappMessage };