"""
Quick test to check Azure OpenAI endpoint status
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_KEY")
api_version = os.getenv("AZURE_OPENAI_API_VERSION")
deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")

print("="*80)
print("🔍 CHECKING AZURE OPENAI ENDPOINT STATUS")
print("="*80)

# Test 1: Check if endpoint is reachable
print(f"\n1️⃣ Testing endpoint: {endpoint}")
try:
    # Just check if the base URL responds
    response = requests.get(endpoint, timeout=5)
    print(f"   ✅ Endpoint is reachable (Status: {response.status_code})")
except requests.exceptions.SSLError:
    print(f"   ⚠️ SSL/Certificate issue - but endpoint exists")
except requests.exceptions.Timeout:
    print(f"   ❌ Timeout - endpoint may be down or blocked")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Connection failed - endpoint may not exist or network issue")
except Exception as e:
    print(f"   ⚠️ Error: {e}")

# Test 2: Try to list deployments
print(f"\n2️⃣ Testing API authentication...")
url = f"{endpoint}/openai/deployments?api-version={api_version}"
headers = {
    "api-key": api_key
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("   ✅ Authentication successful!")
        data = response.json()
        if 'data' in data and len(data['data']) > 0:
            print(f"\n   📋 Available deployments:")
            for dep in data['data']:
                print(f"      • {dep.get('id', 'Unknown')}")
        else:
            print("   ⚠️ No deployments found")
    
    elif response.status_code == 401:
        print("   ❌ Authentication failed - Invalid API key")
        
    elif response.status_code == 403:
        print("   ❌ Access denied - Firewall/VPN blocking your IP")
        print("   💡 This is your current issue!")
        
    elif response.status_code == 404:
        print("   ❌ Endpoint not found - May be incorrect or decommissioned")
        
    else:
        print(f"   ⚠️ Unexpected status: {response.text}")
        
except requests.exceptions.Timeout:
    print(f"   ❌ Request timeout")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Check specific deployment
print(f"\n3️⃣ Testing specific deployment: {deployment}")
url = f"{endpoint}/openai/deployments/{deployment}?api-version={api_version}"

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"   ✅ Deployment '{deployment}' exists and is accessible")
    elif response.status_code == 403:
        print(f"   ❌ Deployment exists but access denied (Firewall)")
    elif response.status_code == 404:
        print(f"   ❌ Deployment '{deployment}' not found")
    else:
        print(f"   ⚠️ Status: {response.text[:200]}")
        
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*80)
print("📊 SUMMARY")
print("="*80)
print("\nIf you see 403 errors → Contact your IT admin to:")
print("   • Add your IP to the firewall whitelist")
print("   • Check if VPN is required")
print("   • Verify the endpoint is still active")
print("\nIf you see 404 errors → The endpoint or deployment may have changed")
print("If you see 401 errors → The API key may have expired")
print("="*80)
