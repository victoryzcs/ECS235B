import unittest
import os 
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.access_matrix import AccessMatrix 
class TestAccessMatrix(unittest.TestCase):

    def setUp(self):
        self.acm = AccessMatrix()

    def test_add_and_check_permission(self):
        self.acm.add_permission("Victor", "secret.txt", "read")
        self.assertTrue(self.acm.check_permission("Victor", "secret.txt", "read"))
        self.assertFalse(self.acm.check_permission("Victor", "secret.txt", "write"))

    def test_remove_permission(self):
        self.acm.add_permission("Sarah", "file.txt", "write")
        self.acm.remove_permission("Sarah", "file.txt", "write")
        self.assertFalse(self.acm.check_permission("Sarah", "file.txt", "write"))
        self.assertNotIn("Sarah", self.acm.matrix)  

    def test_multiple_permissions(self):
        self.acm.add_permission("Victor", "data.csv", "read")
        self.acm.add_permission("Victor", "data.csv", "write")
        self.assertTrue(self.acm.check_permission("Victor", "data.csv", "read"))
        self.assertTrue(self.acm.check_permission("Victor", "data.csv", "write"))
        self.acm.remove_permission("Victor", "data.csv", "read")
        self.assertFalse(self.acm.check_permission("Victor", "data.csv", "read"))
        self.assertTrue(self.acm.check_permission("Victor", "data.csv", "write"))

    def test_to_dict_and_from_dict(self):
        self.acm.add_permission("Victor", "file1.txt", "read")

        self.acm.add_permission("Victor", "file1.txt", "write")
        self.acm.add_permission("Sarah", "file2.txt", "read")

        data = self.acm.to_dict()
        new_acm = AccessMatrix.from_dict(data)

        self.assertTrue(new_acm.check_permission("Victor", "file1.txt", "read"))
        self.assertTrue(new_acm.check_permission("Victor", "file1.txt", "write"))
        self.assertTrue(new_acm.check_permission("Sarah", "file2.txt", "read"))
        self.assertFalse(new_acm.check_permission("Sarah", "file1.txt", "read"))

    def test_complex_permissions(self):
        self.acm.add_permission("Victor", "file1.txt", "read")
        self.acm.add_permission("Victor", "file1.txt", "write")
        self.acm.add_permission("Victor", "file1.txt", "delete")
        self.acm.add_permission("Victor", "file1.txt", "share")
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "read"))
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "write"))
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "delete"))
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "share"))  
        self.acm.remove_permission("Victor", "file1.txt", "delete")
        self.assertFalse(self.acm.check_permission("Victor", "file1.txt", "delete"))
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "read"))
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "write"))
        self.assertTrue(self.acm.check_permission("Victor", "file1.txt", "share"))

if __name__ == '__main__':
    # sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    print(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    unittest.main()
