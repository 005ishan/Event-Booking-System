const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Event Booking System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Verification Code - Event Booking System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Event Booking System</h1>
          <p style="color: #e0e0e0; margin: 8px 0 0;">Email Verification</p>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333333; margin-top: 0;">Hello! 👋</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Thank you for registering with <b>Event Booking System</b>. 
            Please use the OTP below to verify your email address.
          </p>

          <!-- OTP Box -->
          <div style="background: linear-gradient(135deg, #6a11cb, #2575fc); border-radius: 10px; padding: 25px; text-align: center; margin: 30px 0;">
            <p style="color: #e0e0e0; margin: 0 0 10px; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Your OTP Code</p>
            <h1 style="color: #ffffff; font-size: 48px; margin: 0; letter-spacing: 10px;">${otp}</h1>
          </div>

          <!-- Expiry Warning -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⏰ <b>This OTP will expire in 10 minutes.</b> Please verify as soon as possible.
            </p>
          </div>

          <p style="color: #555555; font-size: 15px; line-height: 1.6;">
            If you did not create an account with us, please ignore this email or contact our support team immediately.
          </p>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />

          <p style="color: #aaaaaa; font-size: 13px; text-align: center; margin: 0;">
            © 2026 Event Booking System. All rights reserved.<br/>
            This is an automated email, please do not reply.
          </p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"Event Booking System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Event Booking System 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #11998e, #38ef7d); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Event Booking System</h1>
          <p style="color: #e0e0e0; margin: 8px 0 0;">Registration Successful</p>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
          
          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background-color: #e8f5e9; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">✅</span>
            </div>
          </div>

          <h2 style="color: #333333; margin-top: 0; text-align: center;">Welcome aboard, ${name}! 🎉</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">
            Your account has been <b>successfully verified</b>. You're all set to start booking amazing events!
          </p>

          <!-- What's Next Box -->
          <div style="background-color: #f0fdf4; border-left: 4px solid #38ef7d; padding: 20px; border-radius: 5px; margin: 25px 0;">
            <p style="color: #333; margin: 0 0 10px; font-weight: bold;">🚀 What you can do now:</p>
            <ul style="color: #555555; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
              <li>Browse upcoming events</li>
              <li>Book your favorite events</li>
              <li>Manage your bookings</li>
              <li>Get event reminders</li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/login" 
               style="background: linear-gradient(135deg, #11998e, #38ef7d); color: #ffffff; padding: 14px 40px; border-radius: 25px; text-decoration: none; font-size: 16px; font-weight: bold;">
              Login Now →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />

          <p style="color: #aaaaaa; font-size: 13px; text-align: center; margin: 0;">
            © 2026 Event Booking System. All rights reserved.<br/>
            This is an automated email, please do not reply.
          </p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendBookingConfirmationEmail = async (email, name, bookingDetails) => {
  const mailOptions = {
    from: `"Event Booking System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Booking Confirmed 🎉 - Event Booking System",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Event Booking System</h1>
          <p style="color: #e0e0e0; margin: 8px 0 0;">Booking Confirmation</p>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

          <!-- Success Icon -->
          <div style="text-align: center; margin-bottom: 25px;">
            <span style="font-size: 60px;">🎊</span>
          </div>

          <h2 style="color: #333333; margin-top: 0; text-align: center;">Booking Confirmed, ${name}!</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6; text-align: center;">
            Your booking has been <b>successfully confirmed</b>. Here are your booking details:
          </p>

          <!-- Booking Details Box -->
          <div style="background-color: #fff5f8; border-radius: 10px; padding: 25px; margin: 25px 0; border: 1px solid #f5576c22;">
            <p style="color: #333; margin: 0 0 15px; font-weight: bold; font-size: 16px;">📋 Booking Details</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Event Name</td>
                <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold;">${bookingDetails.eventName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Date</td>
                <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold;">${bookingDetails.date}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Time</td>
                <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold;">${bookingDetails.time}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Location</td>
                <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold;">${bookingDetails.location}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eeeeee;">
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Seats</td>
                <td style="padding: 10px 0; color: #333333; font-size: 14px; font-weight: bold;">${bookingDetails.seats}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #888888; font-size: 14px;">Total Amount</td>
                <td style="padding: 10px 0; color: #f5576c; font-size: 16px; font-weight: bold;">$${bookingDetails.totalAmount}</td>
              </tr>
            </table>
          </div>

          <!-- Warning Box -->
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              📌 <b>Please arrive 15 minutes before the event starts.</b> Bring this email or your booking ID as proof of booking.
            </p>
          </div>

          <!-- Booking ID -->
          <div style="background: linear-gradient(135deg, #f093fb, #f5576c); border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 25px;">
            <p style="color: #ffe0e0; margin: 0 0 5px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Booking ID</p>
            <p style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 3px;">${bookingDetails.bookingId}</p>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/bookings" 
               style="background: linear-gradient(135deg, #f093fb, #f5576c); color: #ffffff; padding: 14px 40px; border-radius: 25px; text-decoration: none; font-size: 16px; font-weight: bold;">
              View My Bookings →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 25px 0;" />

          <p style="color: #aaaaaa; font-size: 13px; text-align: center; margin: 0;">
            © 2026 Event Booking System. All rights reserved.<br/>
            This is an automated email, please do not reply.
          </p>
        </div>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
};
