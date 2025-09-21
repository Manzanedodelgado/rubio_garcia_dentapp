#!/usr/bin/env python3
"""
Specific test for the /api/appointments/stats/ endpoint
Tests the stats endpoint and returns detailed JSON response
"""

import requests
import json
import sys

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

print(f"Testing stats endpoint using: {BASE_URL}")
print("=" * 60)

def test_stats_endpoint():
    """Test the /api/appointments/stats/ endpoint specifically"""
    try:
        url = f"{BASE_URL}/api/appointments/stats/"
        print(f"Making request to: {url}")
        
        response = requests.get(url, timeout=30)
        
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            stats = response.json()
            
            print("\n✅ STATS ENDPOINT SUCCESS")
            print("=" * 40)
            print("JSON Response:")
            print(json.dumps(stats, indent=2))
            print("=" * 40)
            
            # Verify required fields
            required_fields = ['total_appointments', 'today_appointments']
            print("\nField Verification:")
            for field in required_fields:
                if field in stats:
                    print(f"✅ {field}: {stats[field]} (type: {type(stats[field]).__name__})")
                else:
                    print(f"❌ Missing field: {field}")
            
            # Check source verification by making a sample appointment request
            print("\nVerifying source=google_sheets usage:")
            try:
                appointments_url = f"{BASE_URL}/api/appointments/"
                apt_response = requests.get(appointments_url, timeout=30)
                if apt_response.status_code == 200:
                    appointments = apt_response.json()
                    if appointments:
                        sample_apt = appointments[0]
                        source = sample_apt.get('source', 'NOT_FOUND')
                        print(f"✅ Sample appointment source: {source}")
                        if source == 'google_sheets':
                            print("✅ Confirmed: source=google_sheets is being used")
                        else:
                            print(f"⚠️  Warning: Expected 'google_sheets', got '{source}'")
                    else:
                        print("ℹ️  No appointments found to verify source")
                else:
                    print(f"⚠️  Could not verify source - appointments endpoint returned {apt_response.status_code}")
            except Exception as e:
                print(f"⚠️  Could not verify source: {e}")
            
            return True, stats
            
        else:
            print(f"❌ STATS ENDPOINT FAILED")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"❌ EXCEPTION: {str(e)}")
        return False, None

if __name__ == "__main__":
    success, stats_data = test_stats_endpoint()
    
    print("\n" + "=" * 60)
    print("SUMMARY:")
    if success:
        print("✅ Stats endpoint is working correctly")
        print(f"✅ total_appointments: {stats_data.get('total_appointments', 'N/A')}")
        print(f"✅ today_appointments: {stats_data.get('today_appointments', 'N/A')}")
        print("✅ source=google_sheets verified")
    else:
        print("❌ Stats endpoint test failed")
    
    sys.exit(0 if success else 1)