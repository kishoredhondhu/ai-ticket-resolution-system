"""

Test RAG Service

Test the RAG service with sample tickets.

"""


 

import requests

import json


 

# Service URL

BASE_URL = "http://localhost:8000"


 

def test_health():

    """Test health endpoint."""

    print("="*60)

    print("Testing Health Endpoint")

    print("="*60)

   

    response = requests.get(f"{BASE_URL}/health")

    print(f"Status: {response.status_code}")

    print(f"Response: {json.dumps(response.json(), indent=2)}")

    print()


 

def test_suggest_resolution():

    """Test resolution suggestion."""

    print("="*60)

    print("Testing Resolution Suggestion")

    print("="*60)

   

    # Test ticket

    test_tickets = [

        {

            "category": "Network Problem",

            "priority": "High",

            "description": "Cannot connect to Wi-Fi network"

        },

        {

            "category": "Login Issue",

            "priority": "Critical",

            "description": "Password reset not working"

        },

        {

            "category": "Email Issues",

            "priority": "Medium",

            "description": "Emails not syncing on mobile device"

        }

    ]

   

    for i, ticket in enumerate(test_tickets, 1):

        print(f"\nTest {i}:")

        print(f"Category: {ticket['category']}")

        print(f"Priority: {ticket['priority']}")

        print(f"Description: {ticket['description']}")

        print("-" * 60)

       

        response = requests.post(

            f"{BASE_URL}/api/suggest-resolution",

            json=ticket

        )

       

        if response.status_code == 200:

            result = response.json()

            print(f"\n✓ Suggested Resolution:")

            print(result['suggested_resolution'])

            print(f"\nConfidence: {result['confidence']:.2f}")

            print(f"\nSimilar Tickets Found: {len(result['similar_tickets'])}")

           

            if result['similar_tickets']:

                print("\nTop Similar Ticket:")

                top = result['similar_tickets'][0]

                print(f"  - Category: {top['category']}")

                print(f"  - Similarity: {top['similarity_score']:.2f}")

                print(f"  - Description: {top['description'][:100]}...")

        else:

            print(f"❌ Error: {response.status_code}")

            print(response.text)

       

        print("\n" + "="*60)


 

def test_stats():

    """Test stats endpoint."""

    print("\nTesting Stats Endpoint")

    print("="*60)

   

    response = requests.get(f"{BASE_URL}/api/stats")

    print(f"Status: {response.status_code}")

    print(f"Response: {json.dumps(response.json(), indent=2)}")

    print()


 

def main():

    print("\n" + "="*60)

    print("RAG SERVICE TEST SUITE")

    print("="*60)

    print()

   

    try:

        # Test health

        test_health()

       

        # Test stats

        test_stats()

       

        # Test resolution suggestion

        test_suggest_resolution()

       

        print("\n✅ All tests completed!")

       

    except requests.exceptions.ConnectionError:

        print("\n❌ Could not connect to RAG service")

        print("Make sure the service is running: python app.py")

    except Exception as e:

        print(f"\n❌ Test failed: {e}")


 

if __name__ == "__main__":

    main()


 