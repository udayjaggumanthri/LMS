"""Tax invoice figures for a paid LMS order. Does not change the amount charged."""
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction as db_transaction

from apps.admin_governance.models import PlatformSettings
from apps.orders.models import Order

TWOPLACES = Decimal('0.01')
_BELOW_TWENTY = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
]
_TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']


def _money(value) -> Decimal:
    return Decimal(str(value or 0)).quantize(TWOPLACES, rounding=ROUND_HALF_UP)


def _two_digits(value: int) -> str:
    if value < 20:
        return _BELOW_TWENTY[value]
    ten, one = divmod(value, 10)
    return _TENS[ten] if one == 0 else f'{_TENS[ten]} {_BELOW_TWENTY[one]}'


def _indian_group(value: int) -> str:
    if value == 0:
        return ''
    hundred, rest = divmod(value, 100)
    parts = []
    if hundred:
        parts.append(f'{_BELOW_TWENTY[hundred]} Hundred')
    if rest:
        parts.append(_two_digits(rest))
    return ' '.join(parts)


def amount_in_words(amount) -> str:
    total = _money(amount)
    rupees = int(total)
    paise = int((total - Decimal(rupees)) * 100)
    if rupees == 0 and paise == 0:
        return 'Zero Rupees Only'
    crore, rest = divmod(rupees, 10000000)
    lakh, rest = divmod(rest, 100000)
    thousand, rest = divmod(rest, 1000)
    parts = []
    if crore:
        parts.append(f'{_indian_group(crore)} Crore')
    if lakh:
        parts.append(f'{_indian_group(lakh)} Lakh')
    if thousand:
        parts.append(f'{_indian_group(thousand)} Thousand')
    if rest:
        parts.append(_indian_group(rest))
    words = ' '.join(part for part in parts if part).strip() or 'Zero'
    if paise:
        return f'{words} Rupees and {_two_digits(paise)} Paise Only'
    return f'{words} Rupees Only'


def tax_breakdown(total, gst_rate_percent):
    paid = _money(total)
    rate = Decimal(str(gst_rate_percent or 0))
    if rate <= 0:
        return {
            'taxable': paid,
            'cgst': Decimal('0.00'),
            'sgst': Decimal('0.00'),
            'round_off': Decimal('0.00'),
            'total': paid,
            'cgst_rate': Decimal('0'),
            'sgst_rate': Decimal('0'),
        }
    taxable = (paid / (Decimal('1') + (rate / Decimal('100')))).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    gst = (paid - taxable).quantize(TWOPLACES)
    cgst = (gst / Decimal('2')).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
    sgst = (gst - cgst).quantize(TWOPLACES)
    half_rate = (rate / Decimal('2')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    return {
        'taxable': taxable,
        'cgst': cgst,
        'sgst': sgst,
        'round_off': Decimal('0.00'),
        'total': paid,
        'cgst_rate': half_rate,
        'sgst_rate': half_rate,
    }


def assign_tax_invoice_number(order: Order) -> str:
    if order.tax_invoice_number:
        return order.tax_invoice_number
    with db_transaction.atomic():
        locked = Order.objects.select_for_update().get(pk=order.pk)
        if locked.tax_invoice_number:
            order.tax_invoice_number = locked.tax_invoice_number
            return locked.tax_invoice_number
        settings = PlatformSettings.objects.select_for_update().filter(key='global').first()
        if settings is None:
            PlatformSettings.objects.create(key='global')
            settings = PlatformSettings.objects.select_for_update().get(key='global')
        number = int(settings.invoice_next_number or 1)
        while Order.objects.filter(tax_invoice_number=str(number)).exists():
            number += 1
        locked.tax_invoice_number = str(number)
        locked.save(update_fields=['tax_invoice_number', 'updated_at'])
        settings.invoice_next_number = number + 1
        settings.save(update_fields=['invoice_next_number', 'updated_at'])
        order.tax_invoice_number = locked.tax_invoice_number
        return locked.tax_invoice_number


def _line_amounts(items, taxable: Decimal):
    prices = [_money(item.price_at_purchase) for item in items]
    gross = sum(prices, Decimal('0.00'))
    shares = []
    allocated = Decimal('0.00')
    for index, price in enumerate(prices):
        if index == len(prices) - 1:
            share = (taxable - allocated).quantize(TWOPLACES)
        elif gross <= 0:
            share = Decimal('0.00')
        else:
            share = (taxable * price / gross).quantize(TWOPLACES, rounding=ROUND_HALF_UP)
            allocated += share
        shares.append(share)
    return shares


def build_tax_invoice(order: Order) -> dict:
    settings, _ = PlatformSettings.objects.get_or_create(key='global')
    figures = tax_breakdown(order.total, settings.gst_rate_percent)
    items = list(order.items.all())
    shares = _line_amounts(items, figures['taxable'])
    user = order.user
    full_name = f'{user.first_name} {user.last_name}'.strip()
    company = f'{settings.legal_name} {settings.company_line}'.strip()
    lines = []
    for index, item in enumerate(items):
        amount = shares[index] if index < len(shares) else Decimal('0.00')
        lines.append({
            'title': item.course_title,
            'quantity': 1,
            'price': str(amount),
            'amount': str(amount),
        })
    course_title = items[0].course_title if len(items) == 1 else ', '.join(item.course_title for item in items)
    issued = order.created_at
    return {
        'company': {
            'legalName': settings.legal_name,
            'companyLine': settings.company_line,
            'fullName': company,
            'address': settings.invoice_address,
            'phone': settings.invoice_phone,
            'email': settings.invoice_email,
            'gstNumber': settings.gst_number,
            'declaration': settings.invoice_declaration,
            'signatureUrl': settings.signature_url or '',
            'stampUrl': settings.stamp_url or '',
        },
        'invoiceNumber': order.tax_invoice_number or '',
        'date': issued.strftime('%d %B %Y').lstrip('0') if issued else '',
        'customer': {
            'name': order.billing_name or full_name or user.username,
            'email': order.billing_email or user.email or '',
            'phone': order.billing_phone or '',
            'address': '',
        },
        'courseTitle': course_title,
        'paymentMethod': 'Online' if _money(order.total) > 0 else 'Free',
        'lines': lines,
        'quantity': len(lines),
        'taxable': str(figures['taxable']),
        'cgstRate': str(figures['cgst_rate']),
        'cgst': str(figures['cgst']),
        'sgstRate': str(figures['sgst_rate']),
        'sgst': str(figures['sgst']),
        'roundOff': str(figures['round_off']),
        'total': str(figures['total']),
        'amountInWords': amount_in_words(figures['total']),
    }
