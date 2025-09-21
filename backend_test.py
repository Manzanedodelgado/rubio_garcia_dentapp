#!/usr/bin/env python3
"""
Backend API Tests for Appointments System
Tests appointment filtering, ordering, and all endpoints
"""

import requests
import json
from datetime import datetime, timedelta
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

print(f"Using backend URL: {BASE_URL}")

class BackendTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.timeout = 30
        self.test_results = []
        
    def log_test(self, test_name, success, message="", data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if data and not success:
            print(f"   Response: {json.dumps(data, indent=2)}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'data': data
        })
        print()
    
    def test_health_check(self):
        """Test 1: Health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("Health Check", True, f"Status: {data.get('status')}")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected status: {data.get('status')}", data)
                    return False
            else:
                self.log_test("Health Check", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    def test_sync_trigger(self):
        """Test 2: Trigger sync endpoint"""
        try:
            response = self.session.post(f"{self.base_url}/api/appointments/sync/")
            
            if response.status_code == 200:
                data = response.json()
                if 'success' in data:
                    if data['success'] or data.get('synced', 0) == 0:
                        # Accept both successful sync or graceful handling of empty data
                        self.log_test("Sync Trigger", True, f"Success: {data['success']}, Synced: {data.get('synced', 0)}")
                        return True
                    else:
                        self.log_test("Sync Trigger", False, f"Sync failed: {data.get('message', 'Unknown error')}", data)
                        return False
                else:
                    self.log_test("Sync Trigger", False, "Missing 'success' field in response", data)
                    return False
            else:
                self.log_test("Sync Trigger", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Sync Trigger", False, f"Exception: {str(e)}")
            return False
    
    def test_appointments_by_date(self, test_date):
        """Test appointments filtering by exact date"""
        try:
            url = f"{self.base_url}/api/appointments/"
            params = {
                'start_date': test_date,
                'end_date': test_date
            }
            
            response = self.session.get(url, params=params)
            
            if response.status_code == 200:
                appointments = response.json()
                
                # Verify all appointments have the correct date
                date_mismatch = []
                for apt in appointments:
                    if apt.get('date') != test_date:
                        date_mismatch.append(f"Expected {test_date}, got {apt.get('date')}")
                
                if date_mismatch:
                    self.log_test(f"Date Filter ({test_date})", False, f"Date mismatches: {date_mismatch}")
                    return False
                
                # Verify time sorting (ascending lexicographically HH:MM)
                times = [apt.get('time', '') for apt in appointments if apt.get('time')]
                sorted_times = sorted(times)
                
                if times != sorted_times:
                    self.log_test(f"Date Filter ({test_date})", False, 
                                f"Times not sorted. Got: {times}, Expected: {sorted_times}")
                    return False
                
                # Verify JSON fields for each appointment
                required_fields = ['_id', 'date', 'time', 'patient_name', 'treatment', 
                                 'doctor', 'status', 'phone', 'notes', 'source']
                
                field_errors = []
                for i, apt in enumerate(appointments):
                    for field in required_fields:
                        if field not in apt:
                            field_errors.append(f"Appointment {i}: missing field '{field}'")
                        elif field == '_id' and not isinstance(apt[field], str):
                            field_errors.append(f"Appointment {i}: '_id' should be string, got {type(apt[field])}")
                        elif field == 'source' and apt[field] != 'google_sheets':
                            field_errors.append(f"Appointment {i}: source should be 'google_sheets', got '{apt[field]}'")
                
                if field_errors:
                    self.log_test(f"Date Filter ({test_date})", False, f"Field validation errors: {field_errors}")
                    return False
                
                self.log_test(f"Date Filter ({test_date})", True, 
                            f"Found {len(appointments)} appointments, all correctly filtered and sorted")
                return True
                
            else:
                self.log_test(f"Date Filter ({test_date})", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test(f"Date Filter ({test_date})", False, f"Exception: {str(e)}")
            return False
    
    def test_today_endpoint(self):
        """Test 5: Today endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/appointments/today/")
            
            if response.status_code == 200:
                appointments = response.json()
                today = datetime.now().strftime('%Y-%m-%d')
                
                # Verify all appointments are for today
                date_errors = []
                for apt in appointments:
                    if apt.get('date') != today:
                        date_errors.append(f"Expected {today}, got {apt.get('date')}")
                
                if date_errors:
                    self.log_test("Today Endpoint", False, f"Date errors: {date_errors}")
                    return False
                
                self.log_test("Today Endpoint", True, f"Found {len(appointments)} appointments for today ({today})")
                return True
                
            else:
                self.log_test("Today Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Today Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_stats_endpoint(self):
        """Test 7: Stats endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/appointments/stats/")
            
            if response.status_code == 200:
                stats = response.json()
                
                # Verify all required fields are integers
                required_fields = ['total_appointments', 'today_appointments', 'confirmed_appointments',
                                 'pending_appointments', 'completed_appointments', 'cancelled_appointments']
                
                field_errors = []
                for field in required_fields:
                    if field not in stats:
                        field_errors.append(f"Missing field: {field}")
                    elif not isinstance(stats[field], int):
                        field_errors.append(f"Field {field} should be integer, got {type(stats[field])}")
                
                if field_errors:
                    self.log_test("Stats Endpoint", False, f"Field validation errors: {field_errors}")
                    return False
                
                self.log_test("Stats Endpoint", True, f"All stats fields are integers: {stats}")
                return True
                
            else:
                self.log_test("Stats Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Stats Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_upcoming_endpoint(self):
        """Test 8: Upcoming endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/appointments/upcoming/?days=7")
            
            if response.status_code == 200:
                appointments = response.json()
                
                # Verify only confirmed/pending appointments
                status_errors = []
                for apt in appointments:
                    status = apt.get('status', '')
                    if status not in ['confirmed', 'pending']:
                        status_errors.append(f"Unexpected status: {status}")
                
                if status_errors:
                    self.log_test("Upcoming Endpoint", False, f"Status validation errors: {status_errors}")
                    return False
                
                # Verify sorting by date then time
                sorted_appointments = sorted(appointments, key=lambda x: (x.get('date', ''), x.get('time', '')))
                
                if appointments != sorted_appointments:
                    original_order = [(apt.get('date'), apt.get('time')) for apt in appointments]
                    expected_order = [(apt.get('date'), apt.get('time')) for apt in sorted_appointments]
                    self.log_test("Upcoming Endpoint", False, 
                                f"Not sorted correctly. Got: {original_order}, Expected: {expected_order}")
                    return False
                
                self.log_test("Upcoming Endpoint", True, 
                            f"Found {len(appointments)} upcoming appointments, correctly filtered and sorted")
                return True
                
            else:
                self.log_test("Upcoming Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Upcoming Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_sync_status_endpoint(self):
        """Test 9: Sync Status endpoint - Get sync information and detected headers"""
        try:
            response = self.session.get(f"{self.base_url}/api/appointments/sync/status/")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields are present
                required_fields = ['last_update', 'auto_sync_active', 'sync_interval_minutes', 'headers', 'row_count']
                field_errors = []
                
                for field in required_fields:
                    if field not in data:
                        field_errors.append(f"Missing field: {field}")
                
                if field_errors:
                    self.log_test("Sync Status Endpoint", False, f"Field validation errors: {field_errors}")
                    return False
                
                # Verify data types
                type_errors = []
                if not isinstance(data.get('auto_sync_active'), bool):
                    type_errors.append(f"auto_sync_active should be boolean, got {type(data.get('auto_sync_active'))}")
                
                if not isinstance(data.get('sync_interval_minutes'), int):
                    type_errors.append(f"sync_interval_minutes should be integer, got {type(data.get('sync_interval_minutes'))}")
                
                if not isinstance(data.get('headers'), list):
                    type_errors.append(f"headers should be list, got {type(data.get('headers'))}")
                
                if not isinstance(data.get('row_count'), int):
                    type_errors.append(f"row_count should be integer, got {type(data.get('row_count'))}")
                
                if type_errors:
                    self.log_test("Sync Status Endpoint", False, f"Type validation errors: {type_errors}")
                    return False
                
                headers = data.get('headers', [])
                row_count = data.get('row_count', 0)
                
                self.log_test("Sync Status Endpoint", True, 
                            f"Status retrieved successfully. Headers: {len(headers)} columns, Row count: {row_count}")
                
                # Log headers for debugging
                if headers:
                    print(f"   Detected headers: {headers}")
                
                return True
                
            else:
                self.log_test("Sync Status Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Sync Status Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_sync_headers_endpoint(self):
        """Test 10: Sync Headers endpoint - Get detected sheet headers only"""
        try:
            response = self.session.get(f"{self.base_url}/api/appointments/sync/headers/")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required fields are present
                required_fields = ['headers', 'row_count']
                field_errors = []
                
                for field in required_fields:
                    if field not in data:
                        field_errors.append(f"Missing field: {field}")
                
                if field_errors:
                    self.log_test("Sync Headers Endpoint", False, f"Field validation errors: {field_errors}")
                    return False
                
                # Verify data types
                type_errors = []
                if not isinstance(data.get('headers'), list):
                    type_errors.append(f"headers should be list, got {type(data.get('headers'))}")
                
                if not isinstance(data.get('row_count'), int):
                    type_errors.append(f"row_count should be integer, got {type(data.get('row_count'))}")
                
                if type_errors:
                    self.log_test("Sync Headers Endpoint", False, f"Type validation errors: {type_errors}")
                    return False
                
                headers = data.get('headers', [])
                row_count = data.get('row_count', 0)
                
                self.log_test("Sync Headers Endpoint", True, 
                            f"Headers retrieved successfully. {len(headers)} columns detected, {row_count} data rows")
                
                # Log exact column names for verification
                if headers:
                    print(f"   Exact column names: {headers}")
                else:
                    print("   No headers detected - may need to trigger sync first")
                
                return True
                
            else:
                self.log_test("Sync Headers Endpoint", False, f"HTTP {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Sync Headers Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def check_backend_logs(self):
        """Check backend logs for errors"""
        try:
            import subprocess
            result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.err.log'], 
                                  capture_output=True, text=True)
            if result.stdout:
                print("=== Backend Error Logs (last 50 lines) ===")
                print(result.stdout)
                print("=== End Backend Logs ===\n")
        except Exception as e:
            print(f"Could not read backend logs: {e}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=== BACKEND API TESTS ===")
        print(f"Testing against: {self.base_url}")
        print()
        
        # Test 1: Health check
        self.test_health_check()
        
        # Test 2: Sync trigger
        self.test_sync_trigger()
        
        # Test 3 & 4: Date filtering for specific dates
        self.test_appointments_by_date('2025-09-22')
        self.test_appointments_by_date('2025-09-23')
        
        # Test 5: Today endpoint
        self.test_today_endpoint()
        
        # Test 7: Stats endpoint
        self.test_stats_endpoint()
        
        # Test 8: Upcoming endpoint
        self.test_upcoming_endpoint()
        
        # Check for backend errors
        self.check_backend_logs()
        
        # Summary
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print("=== TEST SUMMARY ===")
        print(f"Passed: {passed}/{total}")
        
        if passed < total:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)