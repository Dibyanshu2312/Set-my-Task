import requests
import sys
import json
from datetime import datetime

class TaskManagerAPITester:
    def __init__(self, base_url="https://teamwork-tracker-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "status": "PASSED" if success else "FAILED",
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_response = response.json()
                    error_detail += f" - {error_response.get('detail', 'No details')}"
                except:
                    error_detail += f" - Response: {response.text[:200]}"
                
                self.log_test(name, False, error_detail)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            return True
        return False

    def test_user_login(self):
        """Test user login with existing user"""
        if not self.user_data:
            return False
            
        login_data = {
            "email": self.user_data['email'],
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_create_client(self):
        """Test creating a new client"""
        client_data = {
            "name": "Test Client Company",
            "description": "A test client for API testing"
        }
        
        success, response = self.run_test(
            "Create Client",
            "POST",
            "clients",
            200,
            data=client_data
        )
        
        if success and 'id' in response:
            self.client_id = response['id']
            return True
        return False

    def test_get_clients(self):
        """Test getting all clients"""
        success, response = self.run_test(
            "Get Clients",
            "GET",
            "clients",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} clients")
            return True
        return False

    def test_get_tasks_for_client(self):
        """Test getting tasks for a client (should have 11 predefined tasks)"""
        if not hasattr(self, 'client_id'):
            return False
            
        success, response = self.run_test(
            "Get Client Tasks",
            "GET",
            f"tasks/{self.client_id}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} tasks (expected 11 predefined tasks)")
            if len(response) == 11:
                self.tasks = response
                return True
            else:
                self.log_test("Predefined Tasks Count", False, f"Expected 11 tasks, got {len(response)}")
        return False

    def test_create_custom_task(self):
        """Test creating a custom task"""
        if not hasattr(self, 'client_id'):
            return False
            
        task_data = {
            "client_id": self.client_id,
            "title": "Custom Test Task",
            "description": "This is a custom task created during testing",
            "status": "pending"
        }
        
        success, response = self.run_test(
            "Create Custom Task",
            "POST",
            "tasks",
            200,
            data=task_data
        )
        
        if success and 'id' in response:
            self.custom_task_id = response['id']
            return True
        return False

    def test_update_task_status(self):
        """Test updating task status"""
        if not hasattr(self, 'tasks') or not self.tasks:
            return False
            
        task_id = self.tasks[0]['id']
        update_data = {"status": "completed"}
        
        success, response = self.run_test(
            "Update Task Status",
            "PUT",
            f"tasks/{task_id}",
            200,
            data=update_data
        )
        
        if success and response.get('status') == 'completed':
            return True
        return False

    def test_update_task_details(self):
        """Test updating task title and description"""
        if not hasattr(self, 'custom_task_id'):
            return False
            
        update_data = {
            "title": "Updated Custom Task Title",
            "description": "Updated description for the custom task"
        }
        
        success, response = self.run_test(
            "Update Task Details",
            "PUT",
            f"tasks/{self.custom_task_id}",
            200,
            data=update_data
        )
        
        return success

    def test_add_comment_to_task(self):
        """Test adding a comment to a task"""
        if not hasattr(self, 'custom_task_id'):
            return False
            
        comment_data = {
            "task_id": self.custom_task_id,
            "text": "This is a test comment for the task"
        }
        
        success, response = self.run_test(
            "Add Comment to Task",
            "POST",
            "comments",
            200,
            data=comment_data
        )
        
        if success and 'id' in response:
            self.comment_id = response['id']
            return True
        return False

    def test_get_task_comments(self):
        """Test getting comments for a task"""
        if not hasattr(self, 'custom_task_id'):
            return False
            
        success, response = self.run_test(
            "Get Task Comments",
            "GET",
            f"comments/{self.custom_task_id}",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} comments")
            return True
        return False

    def test_delete_comment(self):
        """Test deleting a comment"""
        if not hasattr(self, 'comment_id'):
            return False
            
        success, response = self.run_test(
            "Delete Comment",
            "DELETE",
            f"comments/{self.comment_id}",
            200
        )
        
        return success

    def test_delete_task(self):
        """Test deleting a task"""
        if not hasattr(self, 'custom_task_id'):
            return False
            
        success, response = self.run_test(
            "Delete Task",
            "DELETE",
            f"tasks/{self.custom_task_id}",
            200
        )
        
        return success

    def test_delete_client(self):
        """Test deleting a client (and all its tasks)"""
        if not hasattr(self, 'client_id'):
            return False
            
        success, response = self.run_test(
            "Delete Client",
            "DELETE",
            f"clients/{self.client_id}",
            200
        )
        
        return success

    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Task Manager API Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)

        # Authentication Tests
        print("\n📝 AUTHENTICATION TESTS")
        if not self.test_user_registration():
            print("❌ Registration failed, stopping tests")
            return False
            
        if not self.test_user_login():
            print("❌ Login failed, stopping tests")
            return False
            
        self.test_get_current_user()

        # Client Management Tests
        print("\n👥 CLIENT MANAGEMENT TESTS")
        if not self.test_create_client():
            print("❌ Client creation failed, stopping tests")
            return False
            
        self.test_get_clients()

        # Task Management Tests
        print("\n📋 TASK MANAGEMENT TESTS")
        if not self.test_get_tasks_for_client():
            print("❌ Failed to get predefined tasks")
            
        if not self.test_create_custom_task():
            print("❌ Custom task creation failed")
            
        self.test_update_task_status()
        self.test_update_task_details()

        # Comment System Tests
        print("\n💬 COMMENT SYSTEM TESTS")
        if not self.test_add_comment_to_task():
            print("❌ Comment creation failed")
            
        self.test_get_task_comments()
        self.test_delete_comment()

        # Cleanup Tests
        print("\n🧹 CLEANUP TESTS")
        self.test_delete_task()
        self.test_delete_client()

        # Print Results
        print("\n" + "=" * 60)
        print(f"📊 TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = TaskManagerAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_tests": tester.tests_run,
            "passed_tests": tester.tests_passed,
            "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
            "results": tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())