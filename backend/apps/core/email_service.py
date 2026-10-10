import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.conf import settings
import logging

logger = logging.getLogger('apps.email')

class EmailService:
    @staticmethod
    def get_smtp_config():
        try:
            from apps.admin_governance.models import SMTPSettings
            smtp = SMTPSettings.objects.filter(key='global').first()
            if smtp:
                return smtp
        except Exception as e:
            logger.warning(f"Failed to fetch SMTPSettings: {e}")
        return None

    @classmethod
    def send_email(cls, to_email: str, subject: str, html_content: str, text_content: str = '') -> dict:
        smtp = cls.get_smtp_config()
        if not smtp or not smtp.is_enabled:
            logger.info(f"[SMTP Disabled/Mock] Email to {to_email} | Subject: {subject}")
            return {
                'success': True,
                'status': 'mock_sent',
                'message': 'SMTP is disabled or not configured; email simulated successfully.'
            }

        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            sender_header = f"{smtp.sender_name} <{smtp.from_email}>" if smtp.sender_name else smtp.from_email
            msg['From'] = sender_header
            msg['To'] = to_email

            if text_content:
                msg.attach(MIMEText(text_content, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))

            if smtp.use_ssl:
                server = smtplib.SMTP_SSL(smtp.host, smtp.port, timeout=10)
            else:
                server = smtplib.SMTP(smtp.host, smtp.port, timeout=10)
                if smtp.use_tls:
                    server.starttls()

            if smtp.username and smtp.password:
                server.login(smtp.username, smtp.password)

            server.sendmail(smtp.from_email, [to_email], msg.as_string())
            server.quit()
            logger.info(f"[SMTP Success] Email sent to {to_email} with subject: {subject}")
            return {'success': True, 'status': 'sent', 'message': f'Email successfully delivered to {to_email}'}

        except Exception as e:
            logger.error(f"[SMTP Error] Failed to send email to {to_email}: {str(e)}")
            return {'success': False, 'status': 'error', 'message': str(e)}

    @classmethod
    def send_welcome_email(cls, user):
        smtp = cls.get_smtp_config()
        if smtp and not smtp.send_welcome_email:
            return

        subject = "Welcome to Prajnadhara EDU – Your Learning Journey Begins"
        name = getattr(user, 'first_name', '') or getattr(user, 'name', '') or user.username
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }}
            .header {{ background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }}
            .content {{ padding: 32px 24px; }}
            .greeting {{ font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #0f172a; }}
            .text {{ font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }}
            .cta-btn {{ display: inline-block; background: #047857; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 16px 0; }}
            .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Prajnadhara EDU</h1>
            </div>
            <div class="content">
              <div class="greeting">Hello {name},</div>
              <p class="text">Welcome to <strong>Prajnadhara EDU</strong>! Your account has been verified and your personal learning workspace is active.</p>
              <p class="text">You can explore our production syllabus tracks, enroll in masterclasses, and gain industry-ready engineering skills with live practice.</p>
              <div style="text-align: center;">
                <a href="http://localhost:3000/courses" class="cta-btn">Explore Course Catalog &rarr;</a>
              </div>
              <p class="text" style="font-size: 13px; color: #64748b; margin-top: 24px;">Need help? Contact our academic support at support@prajnadhara.edu anytime.</p>
            </div>
            <div class="footer">
              &copy; 2026 Prajnadhara EDU. All rights reserved. Practical Skill-Based Engineering.
            </div>
          </div>
        </body>
        </html>
        """
        return cls.send_email(user.email, subject, html)

    @classmethod
    def send_purchase_receipt(cls, user, order):
        smtp = cls.get_smtp_config()
        if smtp and not smtp.send_purchase_receipt:
            return

        subject = f"Order Confirmation & Tax Invoice #{order.order_number} – Prajnadhara EDU"
        name = getattr(user, 'first_name', '') or getattr(user, 'name', '') or user.username
        items_html = ""
        for item in order.items.all():
            item_price = float(getattr(item, 'price_at_purchase', getattr(item, 'price', 0)))
            items_html += f"""
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 8px; font-size: 13px; font-weight: 500; color: #1e293b;">{item.course_title}</td>
              <td style="padding: 12px 8px; font-size: 13px; text-align: right; font-weight: 600; color: #0f172a;">₹{item_price:,.2f}</td>
            </tr>
            """

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }}
            .header {{ background: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; }}
            .content {{ padding: 28px 24px; }}
            .receipt-box {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; }}
            .total-row {{ font-size: 15px; font-weight: 700; color: #064e3b; text-align: right; padding-top: 12px; }}
            .cta-btn {{ display: inline-block; background: #047857; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; margin: 16px 0; }}
            .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Prajnadhara EDU</h1>
              <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Payment Confirmed & Enrollment Activated</div>
            </div>
            <div class="content">
              <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px;">Thank you for your enrollment, {name}!</div>
              <p style="font-size: 13px; color: #64748b; margin-top: 0;">Order Reference: <strong>{order.order_number}</strong></p>

              <div class="receipt-box">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: left;">
                      <th style="padding: 8px;">Enrolled Course</th>
                      <th style="padding: 8px; text-align: right;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items_html}
                  </tbody>
                </table>
                <div class="total-row">Total Paid: ₹{float(order.total):,.2f}</div>
              </div>

              <div style="text-align: center;">
                <a href="http://localhost:3000/student/my-learning" class="cta-btn">Access My Courses Now &rarr;</a>
              </div>
            </div>
            <div class="footer">
              &copy; 2026 Prajnadhara EDU. All rights reserved. GST Invoice available in Purchase History.
            </div>
          </div>
        </body>
        </html>
        """
        return cls.send_email(user.email, subject, html)
