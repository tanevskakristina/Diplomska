# Email Confirmation Setup Guide

This guide will help you configure email notifications for customer orders.

## Features

- ✅ Automatic order confirmation emails sent to customers
- ✅ Professional HTML email templates in Macedonian
- ✅ Support for multiple email providers
- ✅ Easy configuration via environment variables

## Prerequisites

- Node.js and npm installed
- An email account with SMTP access
- MongoDB database running

## Setup Instructions

### 1. Gmail Setup (Recommended for Testing)

#### Step 1: Enable 2-Factor Authentication
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click "Security" in the left sidebar
3. Scroll down to "App passwords" and enable it
4. You may need to enable 2-Step Verification first

#### Step 2: Generate App Password
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Copy the 16-character password provided

#### Step 3: Update .env file
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### 2. Other Email Providers (Outlook, Yahoo, etc.)

Use SMTP configuration instead:

```
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

Common SMTP servers:
- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp.outlook.com:587
- **Yahoo**: smtp.mail.yahoo.com:465 (use EMAIL_SECURE=true)
- **Office 365**: smtp.office365.com:587

### 3. Testing the Configuration

1. Start your server:
```bash
npm run dev
```

2. Create a test order at http://localhost:5000/shop.html
3. Check your email inbox for the confirmation message
4. Check server console for any error messages

## Email Templates

The system includes professional HTML email templates that include:
- Order number
- Order date
- Customer details (name, address, phone)
- Product information
- Payment method and status

Emails are sent in both HTML and plain text formats.

## Troubleshooting

### "Email service is not properly configured" Warning
- Check that your `.env` file has the correct email credentials
- Ensure the file is in the project root directory
- Restart the server after updating `.env`

### "Invalid Login" Error
- For Gmail: Verify you're using the 16-character app password, not your regular password
- For other providers: Ensure you have SMTP access enabled
- Check that Less Secure App Access is enabled (if applicable)

### Emails Not Being Sent
1. Check server console logs for error messages
2. Verify email address format is valid
3. Check spam/junk folder
4. Test SMTP credentials with an online tool

### Connection Timeout
- Verify the SMTP host and port are correct
- Check your firewall settings
- Try a different port (usually 465 for SSL, 587 for TLS)

## Production Recommendations

For production deployments:

1. **Use a professional email service**:
   - SendGrid
   - Mailgun
   - AWS SES
   - Brevo (formerly Sendinblue)

2. **Security Best Practices**:
   - Store credentials in a secure vault (never commit .env to git)
   - Use environment variables from your hosting platform
   - Consider using OAuth2 instead of passwords

3. **Email Optimization**:
   - Add email templates to database for easy customization
   - Implement email queue system for better reliability
   - Track email delivery status

## API Integration

The email service is integrated into the order creation endpoint:

```javascript
POST /api/products/orders
{
  "productId": "...",
  "customerName": "...",
  "customerEmail": "customer@example.com",  // Required
  "customerAddress": "...",
  "customerPhone": "..."
}
```

Email is sent automatically after order is created and saved to database.

## Customizing Email Templates

Edit the `emailService.js` file to modify:
- Email subject line
- HTML template design
- Footer information
- Company branding

Look for the `htmlTemplate` variable in the `sendOrderConfirmation()` function.

## Future Enhancements

Possible additions:
- Order status update notifications
- Admin notification when new order arrives
- Customizable email templates in database
- Unsubscribe/preference management
- Email analytics and tracking
