"""
Quick test script to verify RAG service integration
"""
import requests
import json
RAG_URL = "http://localhost:8000"
def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{RAG_URL}/health", timeout=5)
        print(f"✅ Health: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
def test_resolution():
    """Test resolution suggestion endpoint"""
    print("\nTesting resolution suggestion...")
    try:
        data = {
            "category": "Password Reset",
            "priority": "Medium",
            "description": "User unable to login after password expiry notification",
        }
        response = requests.post(
            f"{RAG_URL}/api/suggest-resolution", json=data, timeout=30
        )
        print(f"✅ Resolution: {response.status_code}")
        result = response.json()
        print(f"\nSuggested Resolution:")
        print(result.get("suggested_resolution", "N/A"))
        print(f"\nConfidence: {result.get('confidence', 0) * 100:.1f}%")
        print(f"Similar Tickets: {len(result.get('similar_tickets', []))}")
        print(f"Method: {result.get('method', 'N/A')}")
        return True
    except Exception as e:
        print(f"❌ Resolution test failed: {e}")
        return False
def test_stats():
    """Test stats endpoint"""
    print("\nTesting stats endpoint...")
    try:
        response = requests.get(f"{RAG_URL}/api/stats", timeout=5)
        print(f"✅ Stats: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return True
    except Exception as e:
        print(f"❌ Stats test failed: {e}")
        return False
if __name__ == "__main__":
    print("=" * 50)
    print("RAG Service Integration Test")
    print("=" * 50)
    # Test endpoints
    results = []
    results.append(("Health Check", test_health()))
    results.append(("Resolution Suggestion", test_resolution()))
    results.append(("Statistics", test_stats()))
    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {name}")
    all_passed = all(result[1] for result in results)
    print("\n" + ("🎉 All tests passed!" if all_passed else "⚠️  Some tests failed"))
