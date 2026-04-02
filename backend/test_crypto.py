from app.core.security import get_password_hash, verify_password

try:
    long_password = "a" * 100
    print(f"Testing long password length: {len(long_password)}")
    hashed = get_password_hash(long_password)
    print(f"Hash success: {hashed[:30]}...")
    valid = verify_password(long_password, hashed)
    print(f"Verify success: {valid}")
    
    # Confirm it is NOT bcrypt
    if "$2b$" in hashed or "$2a$" in hashed:
        print("WARNING: Still using bcrypt format!")
    elif "pbkdf2" in hashed:
         print("SUCCESS: Using pbkdf2 format!")
    else:
        print(f"Unknown format: {hashed}")

except Exception as e:
    print(f"FAILED with error: {e}")
