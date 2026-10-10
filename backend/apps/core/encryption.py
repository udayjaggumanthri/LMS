import base64
import hashlib
from django.conf import settings
from django.db import models
from cryptography.fernet import Fernet, InvalidToken

def get_fernet_key() -> bytes:
    """
    Derives a consistent 32-byte URL-safe base64-encoded key from settings.FIELD_ENCRYPTION_KEY or settings.SECRET_KEY.
    """
    secret = getattr(settings, 'FIELD_ENCRYPTION_KEY', None) or getattr(settings, 'SECRET_KEY', 'default-key-fallback')
    digest = hashlib.sha256(secret.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(digest)

def encrypt_value(raw_text: str) -> str:
    """
    Encrypts sensitive plain text string into a Fernet-encrypted ciphertext prefixed with 'enc:'.
    If already encrypted, returns unchanged.
    """
    if not raw_text:
        return ""
    if raw_text.startswith("enc:"):
        return raw_text
    try:
        f = Fernet(get_fernet_key())
        encrypted = f.encrypt(raw_text.encode('utf-8')).decode('utf-8')
        return f"enc:{encrypted}"
    except Exception:
        return raw_text

def decrypt_value(cipher_text: str) -> str:
    """
    Decrypts a Fernet-encrypted ciphertext string prefixed with 'enc:'.
    If not encrypted (legacy value), returns plain text as is.
    """
    if not cipher_text:
        return ""
    if not cipher_text.startswith("enc:"):
        return cipher_text
    token = cipher_text[4:]
    try:
        f = Fernet(get_fernet_key())
        return f.decrypt(token.encode('utf-8')).decode('utf-8')
    except (InvalidToken, Exception):
        return ""

class EncryptedTextField(models.TextField):
    """
    A Django TextField that transparently encrypts values at rest using AES-128 (Fernet).
    Ciphertext is stored with 'enc:' prefix in the database.
    Decryption is automatic upon retrieval in Python code.
    """
    description = "Field encrypting sensitive text at rest using Fernet"

    def get_prep_value(self, value):
        prep = super().get_prep_value(value)
        if prep:
            return encrypt_value(str(prep))
        return prep

    def from_db_value(self, value, expression, connection):
        if value:
            return decrypt_value(str(value))
        return value

    def to_python(self, value):
        if value:
            return decrypt_value(str(value))
        return value

class EncryptedCharField(models.CharField):
    """
    A Django CharField that transparently encrypts values at rest using AES-128 (Fernet).
    """
    description = "Field encrypting sensitive char strings at rest using Fernet"

    def get_prep_value(self, value):
        prep = super().get_prep_value(value)
        if prep:
            return encrypt_value(str(prep))
        return prep

    def from_db_value(self, value, expression, connection):
        if value:
            return decrypt_value(str(value))
        return value

    def to_python(self, value):
        if value:
            return decrypt_value(str(value))
        return value
