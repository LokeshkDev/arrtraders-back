export const getEmailTemplate = (type, data) => {
  const brandPrimary = '#0F3D2E';
  const brandSecondary = '#D4AF37';
  const brandAccent = '#F8F1E5';
  
  const header = `
    <div style="background-color: ${brandPrimary}; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: ${brandSecondary}; margin: 0; font-family: 'Cinzel', serif; letter-spacing: 4px; font-size: 28px; text-transform: uppercase;">AR RAHMAN</h1>
      <p style="color: ${brandSecondary}; margin: 5px 0 0 0; font-family: 'Lora', serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; font-weight: bold;">Premium Dates & Nuts</p>
    </div>
  `;

  const footer = `
    <div style="background-color: #f4f4f4; padding: 30px 20px; text-align: center; border-radius: 0 0 12px 12px; font-family: 'Open Sans', sans-serif; color: #5a5a5a; font-size: 12px;">
      <p style="margin: 0 0 10px 0;">Quality You Can Trust</p>
      <p style="margin: 0 0 10px 0;">Tambaram, Chennai | +91 9551236099</p>
      <div style="margin-top: 20px;">
        <a href="https://arrahmantraders.com" style="color: ${brandPrimary}; text-decoration: none; font-weight: bold;">Visit Store</a>
      </div>
      <p style="margin-top: 20px; opacity: 0.6;">&copy; 2026 AR Rahman Traders. All rights reserved.</p>
    </div>
  `;

  let content = '';

  switch (type) {
    case 'WELCOME':
      content = `
        <div style="padding: 40px 30px; font-family: 'Lora', serif; color: ${brandPrimary}; line-height: 1.6;">
          <h2 style="font-size: 22px; margin-bottom: 20px;">Welcome to the Family, ${data.name}!</h2>
          <p>Thank you for joining AR Rahman Traders. We are delighted to have you with us on our journey to provide the finest quality dates and nuts from around the world.</p>
          <p>You can now explore our curated collection, track your orders, and enjoy a seamless premium shopping experience.</p>
          <div style="margin: 40px 0; text-align: center;">
            <a href="${data.shopUrl}" style="background-color: ${brandPrimary}; color: ${brandSecondary}; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid ${brandSecondary}; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px;">Start Shopping</a>
          </div>
          <p>If you have any questions, our dedicated support team is just an email away.</p>
        </div>
      `;
      break;

    case 'ORDER_CONFIRMED':
      content = `
        <div style="padding: 40px 30px; font-family: 'Lora', serif; color: ${brandPrimary}; line-height: 1.6;">
          <h2 style="font-size: 22px; margin-bottom: 20px;">Your Order is Confirmed!</h2>
          <p>Hello ${data.name},</p>
          <p>Great news! Your order <strong>#ORD-${data.orderId.substring(data.orderId.length - 6).toUpperCase()}</strong> has been successfully placed and is now being processed.</p>
          
          <div style="background-color: ${brandAccent}; padding: 20px; border-radius: 12px; margin: 30px 0;">
            <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid rgba(15, 61, 46, 0.1); padding-bottom: 10px;">Order Summary</h3>
            ${data.items.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px;">
                <span>${item.name} x ${item.qty}</span>
                <span>₹${(item.price * item.qty).toLocaleString()}</span>
              </div>
            `).join('')}
            <div style="border-top: 1px solid rgba(15, 61, 46, 0.1); margin-top: 10px; padding-top: 10px; font-weight: bold; display: flex; justify-content: space-between;">
              <span>Total Amount</span>
              <span style="color: ${brandPrimary};">₹${data.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <p>We will notify you once your premium treats are on their way to you.</p>
        </div>
      `;
      break;

    case 'ORDER_STATUS_UPDATE':
      let statusText = '';
      let statusEmoji = '📦';
      let subMessage = '';

      if (data.status === 'Shipped') {
        statusText = 'is on its way!';
        statusEmoji = '🚚';
        subMessage = `Your order has been handed over to our courier partner. Tracking Number: <strong>${data.trackingNumber || 'Update Pending'}</strong>`;
      } else if (data.status === 'Delivered') {
        statusText = 'has been delivered!';
        statusEmoji = '✅';
        subMessage = 'We hope you enjoy your premium dates and nuts. Thank you for choosing AR Rahman Traders!';
      } else if (data.status === 'Cancelled') {
        statusText = 'has been cancelled';
        statusEmoji = '❌';
        subMessage = 'If this was unexpected, please contact our support team immediately.';
      } else {
        statusText = `status is now: ${data.status}`;
      }

      content = `
        <div style="padding: 40px 30px; font-family: 'Lora', serif; color: ${brandPrimary}; line-height: 1.6;">
          <div style="text-align: center; font-size: 48px; margin-bottom: 20px;">${statusEmoji}</div>
          <h2 style="font-size: 22px; margin-bottom: 20px; text-align: center;">Order Update</h2>
          <p>Hello ${data.name},</p>
          <p>Your order <strong>#ORD-${data.orderId.substring(data.orderId.length - 6).toUpperCase()}</strong> ${statusText}</p>
          <p style="background-color: ${brandAccent}; padding: 15px; border-radius: 8px; border-left: 4px solid ${brandSecondary};">
            ${subMessage}
          </p>
          <div style="margin: 40px 0; text-align: center;">
            <a href="${data.orderUrl}" style="background-color: ${brandPrimary}; color: ${brandSecondary}; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; border: 1px solid ${brandSecondary}; text-transform: uppercase; letter-spacing: 1.5px; font-size: 14px;">Track Order</a>
          </div>
        </div>
      `;
      break;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Lora:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(15, 61, 46, 0.05);">
          ${header}
          ${content}
          ${footer}
        </div>
      </body>
    </html>
  `;
};
