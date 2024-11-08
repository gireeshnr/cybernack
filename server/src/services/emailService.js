import nodemailer from 'nodemailer';

// Function to send the activation email
export const sendActivationEmail = async (recipientEmail, activationToken) => {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.PROD_APP_URL
      : process.env.APP_URL;

    const activationLink = `${baseUrl}/#/activate-account/${activationToken}`;

    let transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'Activate Your Cybernack Account',
      html: `<p>Welcome to Cybernack!</p>
             <p>Please click on the link below to activate your account and set your password:</p>
             <a href="${activationLink}">Activate Account</a>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Activation email sent successfully to:', recipientEmail);
  } catch (error) {
    console.error('Error sending activation email:', error);
    throw error;
  }
};

// Function to send the password reset email
export const sendPasswordResetEmail = async (recipientEmail, resetToken) => {
  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? process.env.PROD_APP_URL
      : process.env.APP_URL;

    const resetLink = `${baseUrl}/#/reset-password/${resetToken}`;

    let transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'Reset Your Cybernack Password',
      html: `<p>It seems like you requested a password reset for your Cybernack account.</p>
             <p>Please click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', recipientEmail);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};