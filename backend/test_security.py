from app.core.security import get_password_hash, verify_password
import secrets

try:
    long_password = "a" * 100
    print(f"Testing long password length: {len(long_password)}")
    hashed = get_password_hash(long_password)
    print(f"Hash success: {hashed[:10]}...")
    valid = verify_password(long_password, hashed)
    print(f"Verify success: {valid}")

    short_password = "password123"
    print(f"Testing short password length: {len(short_password)}")
    hashed_short = get_password_hash(short_password)
    print(f"Hash short success: {hashed_short[:10]}...")
    valid_short = verify_password(short_password, hashed_short)
    print(f"Verify short success: {valid_short}")

except Exception as e:
    print(f"FAILED with error: {e}")
