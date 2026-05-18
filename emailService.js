const nodemailer = require('nodemailer');

// Create a transporter using environment variables
// You'll need to set these in your .env file:
// EMAIL_SERVICE=gmail (or your email provider)
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASSWORD=your-app-password
// OR use SMTP settings:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASSWORD=your-app-password

let transporter = null;
let isInitialized = false;

// Initialize transporter on demand
function initializeTransporter() {
    if (isInitialized) return;
    
    isInitialized = true;

    // Initialize transporter based on environment variables
    if (process.env.EMAIL_SERVICE && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        try {
            transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            console.log('Email service initialized with:', process.env.EMAIL_SERVICE, process.env.EMAIL_USER);
        } catch (error) {
            console.error('Failed to initialize email service:', error.message);
            transporter = null;
        }
    } else if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        try {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_SECURE === 'true',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            console.log('Email service initialized with SMTP:', process.env.EMAIL_HOST);
        } catch (error) {
            console.error('Failed to initialize email service:', error.message);
            transporter = null;
        }
    } else {
        console.warn('Email service is not properly configured. Orders will not send confirmation emails.');
        console.warn('Set EMAIL_SERVICE/EMAIL_USER/EMAIL_PASSWORD in .env file');
    }
}

// Function to send order confirmation email
async function sendOrderConfirmation(order) {
    // Initialize on first use
    if (!isInitialized) {
        initializeTransporter();
    }
    
    if (!transporter) {
        console.warn('Email service is not configured. Skipping email send.');
        return false;
    }

    try {
        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px 5px 0 0;">
                    <h1 style="color: #333; margin: 0;">Потврда на нарачка</h1>
                    <p style="color: #666; margin: 10px 0 0 0;">Thank you for your order!</p>
                </div>
                
                <div style="padding: 20px;">
                    <h2 style="color: #333;">Детали на нарачката</h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Број на нарачка:</td>
                            <td style="padding: 10px; color: #666;">${order._id}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Датум:</td>
                            <td style="padding: 10px; color: #666;">${new Date(order.createdAt).toLocaleDateString('mk-MK')}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Имe:</td>
                            <td style="padding: 10px; color: #666;">${order.customerName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Адреса:</td>
                            <td style="padding: 10px; color: #666;">${order.customerAddress}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Телефон:</td>
                            <td style="padding: 10px; color: #666;">${order.customerPhone}</td>
                        </tr>
                    </table>

                    <h2 style="color: #333;">Производ</h2>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Назнаве:</td>
                            <td style="padding: 10px; color: #666;">${order.productName}</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 10px; font-weight: bold; color: #333;">Начин на плаќање:</td>
                            <td style="padding: 10px; color: #666;">${order.paymentMethod}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; color: #333;">Статус:</td>
                            <td style="padding: 10px; color: #666;">${order.status}</td>
                        </tr>
                    </table>

                    <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #666;">Нарачката ќе биде обработена и доставена на наведената адреса. Можете да ја следите вашата нарачка во администраторскиот панел или со контактирање на нас преку телефон.</p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; margin: 0;">Со почит,</p>
                        <p style="color: #666; margin: 5px 0 0 0;"><strong>ПЛАНЕТ ФИТНЕС Shop</strong></p>
                    </div>
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@planetfitness.mk',
            to: order.customerEmail,
            subject: `Потврда на нарачка - ${order._id}`,
            html: htmlTemplate,
            text: `Потврда на нарачка\n\nДетали:\nНаучка: ${order._id}\nПроизвод: ${order.productName}\nИме: ${order.customerName}\nАдреса: ${order.customerAddress}\nТелефон: ${order.customerPhone}\nСтатус: ${order.status}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return false;
    }
}

// Function to send status update email
async function sendOrderStatusUpdate(order, newStatus) {
    // Initialize on first use
    if (!isInitialized) {
        initializeTransporter();
    }
    
    if (!transporter) {
        console.warn('Email service is not configured. Skipping email send.');
        return false;
    }

    try {
        const statusMessages = {
            pending: 'Нарачката е примена и во обработка',
            processing: 'Нарачката е во обработка',
            delivered: 'Нарачката е доставена',
            cancelled: 'Нарачката е отказана'
        };

        const htmlTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px 5px 0 0;">
                    <h1 style="color: #333; margin: 0;">Ажурирање на статус на нарачка</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p style="color: #666; font-size: 16px;">${statusMessages[newStatus] || 'Статус на вашата нарачка е ажуриран'}</p>
                    
                    <div style="background-color: #e8f5e9; padding: 15px; border-left: 4px solid #4caf50; border-radius: 3px; margin: 20px 0;">
                        <p style="margin: 0; color: #2e7d32; font-weight: bold;">Број на нарачка: ${order._id}</p>
                        <p style="margin: 5px 0 0 0; color: #2e7d32;">Производ: ${order.productName}</p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #666; margin: 0;">Со почит,</p>
                        <p style="color: #666; margin: 5px 0 0 0;"><strong>ПЛАНЕТ ФИТНЕС Shop</strong></p>
                    </div>
                </div>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@planetfitness.mk',
            to: order.customerEmail,
            subject: `Ажурирање на статус - ${order._id}`,
            html: htmlTemplate,
            text: `Статус на нарачка: ${statusMessages[newStatus] || newStatus}\n\nБрој на нарачка: ${order._id}\nПроизвод: ${order.productName}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status update email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending order status email:', error);
        return false;
    }
}

module.exports = {
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    initializeTransporter
};
