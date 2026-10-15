"""Default LMS mail templates. Admins edit the stored copies."""

WELCOME_HTML = """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background: #064e3b; padding: 32px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px;">PrajnadharaEdu</h1>
    </div>
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; font-weight: 600;">Hello {{name}},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">Welcome to PrajnadharaEdu. Your account is active and your learning workspace is ready.</p>
      <p style="text-align: center;"><a href="{{catalog_url}}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Explore the catalog</a></p>
    </div>
  </div>
</div>
""".strip()

RECEIPT_HTML = """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px;">PrajnadharaEdu</h1>
      <div style="font-size: 13px; margin-top: 4px;">Payment confirmed</div>
    </div>
    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; font-weight: 600;">Thank you, {{name}}.</p>
      <p style="font-size: 13px; color: #64748b;">Order reference: <strong>{{order_number}}</strong></p>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>{{items}}</tbody>
      </table>
      <p style="text-align: right; font-weight: 700; color: #064e3b;">Total paid: {{total}}</p>
      <p style="text-align: center;"><a href="{{learning_url}}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Open my courses</a></p>
    </div>
  </div>
</div>
""".strip()

RESET_HTML = """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px;">PrajnadharaEdu</h1>
    </div>
    <div data-mail-body="1" style="padding: 28px 24px;">
      <p style="font-size: 15px; font-weight: 600;">Hello {{name}},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">We received a request to reset the password for your account. The link below is valid for a short time.</p>
      <p style="text-align: center;"><a href="{{reset_url}}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Choose a new password</a></p>
      <p style="font-size: 13px; color: #64748b;">If you did not ask for this, you can ignore this email. Your password will stay the same.</p>
    </div>
  </div>
</div>
""".strip()

FAILED_HTML = """
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
    <div style="background: #064e3b; padding: 28px 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px;">PrajnadharaEdu</h1>
    </div>
    <div data-mail-body="1" style="padding: 28px 24px;">
      <p style="font-size: 15px; font-weight: 600;">Hello {{name}},</p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569;">Your payment for order <strong>{{order_number}}</strong> is {{status}}. You have not been enrolled, and you can try the checkout again.</p>
      <p style="font-size: 14px;">Amount: <strong>{{total}}</strong></p>
      <p style="text-align: center;"><a href="{{checkout_url}}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Return to checkout</a></p>
    </div>
  </div>
</div>
""".strip()

DEFAULT_TEMPLATES = [
    {
        'key': 'welcome',
        'label': 'Welcome email',
        'description': 'Sent when a new account is created.',
        'subject': 'Welcome to PrajnadharaEdu',
        'body_html': WELCOME_HTML,
        'placeholders': ['name', 'catalog_url'],
    },
    {
        'key': 'purchase_receipt',
        'label': 'Order confirmation',
        'description': 'Sent after a successful course payment.',
        'subject': 'Order confirmation {{order_number}}',
        'body_html': RECEIPT_HTML,
        'placeholders': ['name', 'order_number', 'items', 'total', 'learning_url'],
    },
    {
        'key': 'password_reset',
        'label': 'Forgot password',
        'description': 'Sent when someone asks to reset a password.',
        'subject': 'Reset your PrajnadharaEdu password',
        'body_html': RESET_HTML,
        'placeholders': ['name', 'reset_url'],
    },
    {
        'key': 'payment_failed',
        'label': 'Payment failed',
        'description': 'Sent when a course payment fails or is cancelled.',
        'subject': 'Payment {{status}} for {{order_number}}',
        'body_html': FAILED_HTML,
        'placeholders': ['name', 'order_number', 'total', 'status', 'checkout_url'],
    },
]


def seed_email_templates():
    from apps.admin_governance.models import EmailTemplate

    for row in DEFAULT_TEMPLATES:
        template, created = EmailTemplate.objects.get_or_create(
            key=row['key'],
            defaults={
                'label': row['label'],
                'description': row['description'],
                'subject': row['subject'],
                'body_html': row['body_html'],
                'enabled': True,
                'placeholders': row['placeholders'],
            },
        )
        if created:
            continue
        updates = []
        if template.key == 'purchase_receipt' and template.label == 'Order receipt':
            template.label = row['label']
            updates.append('label')
        if not template.placeholders:
            template.placeholders = row['placeholders']
            updates.append('placeholders')
        if updates:
            template.save(update_fields=updates)
