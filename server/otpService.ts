import twilio from 'twilio';
import crypto from 'crypto';

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

  // Send Email OTP (development mode - logs to console)
  static async sendEmailOtp(email: string, otp: string, name: string): Promise<boolean> {
    try {
      // For now, just log to console in development
      // In production, you would integrate with an email service
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
    } catch (error) {
      console.error('Failed to send Email OTP:', error);
      return false;
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