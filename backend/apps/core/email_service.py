import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    def render_template(cls, template, context):
        subject = template.subject or ''
        html = template.body_html or ''
        for key, value in (context or {}).items():
            token = '{{' + str(key) + '}}'
            subject = subject.replace(token, '' if value is None else str(value))
            html = html.replace(token, '' if value is None else str(value))
        return subject, html

    @classmethod
    def send_template(cls, key, to_email, context):
        from apps.admin_governance.models import EmailTemplate
        from apps.core.email_defaults import seed_email_templates

        seed_email_templates()
        template = EmailTemplate.objects.filter(key=key).first()
        if template is None or not template.enabled:
            logger.info('Email template %s is off or missing; skipped %s', key, to_email)
            return {'success': True, 'status': 'skipped', 'message': 'This message is turned off.'}
        subject, html = cls.render_template(template, context)
        return cls.send_email(to_email, subject, html)

    @classmethod
    def send_welcome_email(cls, user):
        name = getattr(user, 'first_name', '') or getattr(user, 'name', '') or user.username
        return cls.send_template('welcome', user.email, {
            'name': name,
            'catalog_url': 'https://uat.prajnadharaedu.com/courses',
        })

    @classmethod
    def send_purchase_receipt(cls, user, order):
        name = getattr(user, 'first_name', '') or getattr(user, 'name', '') or user.username
        items_html = ''
        for item in order.items.all():
            item_price = float(getattr(item, 'price_at_purchase', getattr(item, 'price', 0)))
            items_html += (
                '<tr><td style="padding: 8px; font-size: 13px;">'
                f'{item.course_title}</td><td style="padding: 8px; text-align: right;">₹{item_price:,.2f}</td></tr>'
            )
        return cls.send_template('purchase_receipt', user.email, {
            'name': name,
            'order_number': order.order_number,
            'items': items_html,
            'total': f'₹{float(order.total):,.2f}',
            'learning_url': 'https://uat.prajnadharaedu.com/student/my-learning',
        })

    @classmethod
    def send_password_reset(cls, user, reset_url):
        name = getattr(user, 'first_name', '') or getattr(user, 'name', '') or user.username
        return cls.send_template('password_reset', user.email, {
            'name': name,
            'reset_url': reset_url,
        })

    @classmethod
    def send_payment_failed(cls, user, order, status_label='Failed'):
        name = getattr(user, 'first_name', '') or getattr(user, 'name', '') or user.username
        return cls.send_template('payment_failed', user.email, {
            'name': name,
            'order_number': order.order_number,
            'total': f'₹{float(order.total):,.2f}',
            'status': status_label,
            'checkout_url': 'https://uat.prajnadharaedu.com/checkout',
        })
