import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resendApiKey = process.env.RESEND_API;
if (!resendApiKey) {
  throw new Error('RESEND_API key is missing!');
}

const resend = new Resend(resendApiKey);

const sendEmail = async ({ sendTo, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'GrocerEase <onboarding@resend.dev>',
      to: sendTo,
      subject,
      html,
    });

    if (error) {
      throw new Error(error?.message || 'Error sending email');
    }

    return data;
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error(
      error?.message || 'An error occurred while sending the email'
    );
  }
};

export default sendEmail;
