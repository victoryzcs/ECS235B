import unittest
import bcrypt
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.auth import hash_password, check_password
class TestAuth(unittest.TestCase):
     
     def test_hash_password(self):
         password = "test_password"
         hashed = hash_password(password)
         self.assertIsNotNone(hashed)
         self.assertTrue(bcrypt.checkpw(password.encode('utf-8'), hashed))

     def test_check_password(self):
         password = "test_password"
         hashed = hash_password(password)
         self.assertTrue(check_password(hashed, password))
         self.assertFalse(check_password(hashed, "wrong_password"))
         self.assertFalse(check_password(None, password))
         self.assertFalse(check_password(hashed, None))
     def test_empty_password(self):
         hashed = hash_password("")
         self.assertIsNone(hashed)
         self.assertFalse(check_password(hashed, ""))
         self.assertFalse(check_password(None, ""))
         self.assertFalse(check_password(hashed, None))
     def test_invalid_hash(self):
         invalid_hash = b"invalid_hash"
         self.assertFalse(check_password(invalid_hash, "test_password"))
         self.assertFalse(check_password(invalid_hash, None))
         self.assertFalse(check_password(None, "test_password"))
         self.assertFalse(check_password(None, None))
     def test_hash_password_with_special_characters(self):
         password = "p@ssw0rd!#"
         hashed = hash_password(password)
         self.assertIsNotNone(hashed)
         self.assertTrue(bcrypt.checkpw(password.encode('utf-8'), hashed))

if __name__ == '__main__':
    print(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    unittest.main()