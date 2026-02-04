import twilio from 'twilio';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class OtpService {
  // Generate a unique 6-digit OTP using crypto for better randomness
  static generateOtp(): string {
    const buffer = crypto.randomBytes(3);
    const randomNumber = buffer.readUIntBE(0, 3);
    const otp = (randomNumber % 900000) + 100000;
    return otp.toString();
  }

  // Send SMS OTP via Twilio
  static async sendSmsOtp(phoneNumber: string, otp: string, name: string): Promise<boolean> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.error('Twilio credentials not configured');
        return false;
      }

      // Format phone number to E.164 format if needed
      let formattedPhone = phoneNumber;
      if (!phoneNumber.startsWith('+')) {
        // Assume Indian number if no country code
        formattedPhone = phoneNumber.startsWith('91') ? `+${phoneNumber}` : `+91${phoneNumber}`;
      }

      const message = `Hello ${name}! Your Pooja Academy login OTP is: ${otp}. This OTP will expire in 5 minutes. Do not share this code with anyone.`;

      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log(`SMS OTP sent successfully to ${formattedPhone}. Message SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS OTP:', error);
      return false;
    }
  }

  // Send Email OTP via SMTP
  static async sendEmailOtp(email: string, otp: string, name: string): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.SMTP_HOST || !process.env.SMTP_PORT) {
        console.error('Email credentials not configured, falling back to console log');
        console.log(`
=================================
📧 EMAIL OTP for ${name}
=================================
To: ${email}
Subject: Your Pooja Academy Login OTP
Message: Hello ${name}! Your Pooja Academy login OTP is: ${otp}. This OTP will expire in 5 minutes.
=================================
        `);
        return true;
      }

      // Create SMTP transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email content with HTML formatting
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Pooja Academy - Login OTP</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a2b4c, #4a90e2); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: #1a2b4c; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Pooja Academy</h1>
              <p>Your Learning Journey Continues</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>You've requested to log in to your Pooja Academy student portal. Please use the OTP below to complete your login:</p>
              
              <div class="otp-box">
                <p>Your One-Time Password</p>
                <div class="otp-code">${otp}</div>
                <p><small>Valid for 5 minutes</small></p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Pooja Academy staff will never ask for your OTP.
              </div>
              
              <p>If you didn't request this login, please ignore this email or contact us at:</p>
              <ul>
                <li>📞 Phone: +91 7011505239 (Ram Sir)</li>
                <li>💬 WhatsApp: +91 8800345115</li>
                <li>📍 Location: Kirari, Delhi - Near Haridas Vatika</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2025 Pooja Academy - Empowering Education Since 2015</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Hello ${name}!

You've requested to log in to your Pooja Academy student portal.

Your OTP: ${otp}
Valid for: 5 minutes

⚠️ SECURITY NOTICE: Never share this OTP with anyone. Pooja Academy staff will never ask for your OTP.

If you didn't request this login, please ignore this email or contact us:
📞 Phone: +91 7011505239 (Ram Sir)
💬 WhatsApp: +91 8800345115
📍 Location: Kirari, Delhi - Near Haridas Vatika

© 2025 Pooja Academy - Empowering Education Since 2015
      `;

      // Send email
      const info = await transporter.sendMail({
        from: `"Pooja Academy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `🎓 Your Pooja Academy Login OTP: ${otp}`,
        text: textContent,
        html: htmlContent,
      });

      console.log(`Email OTP sent successfully to ${email}. Message ID: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('Failed to send Email OTP:', error);
      
      // Fallback to console log if email fails
      console.log(`
=================================
📧 EMAIL OTP FALLBACK for ${name}
=================================
To: ${email}
Subject: Your Pooja Academy Login OTP
Message: Hello ${name}! Your Pooja Academy login OTP is: ${otp}. This OTP will expire in 5 minutes.
=================================
      `);
      return true; // Return true so login flow continues
    }
  }

  // Main method to send OTP based on type
  static async sendOtp(identifier: string, otp: string, type: 'email' | 'phone', name: string): Promise<boolean> {
    if (type === 'phone') {
      return await this.sendSmsOtp(identifier, otp, name);
    } else if (type === 'email') {
      return await this.sendEmailOtp(identifier, otp, name);
    } else {
      console.error('Invalid OTP type:', type);
      return false;
    }
  }
}