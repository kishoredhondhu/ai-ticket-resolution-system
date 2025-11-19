"""

Test and Evaluate RAG System

Runs test queries and evaluates performance

"""


 

import requests

import json

from evaluator import evaluator


 

BASE_URL = "http://localhost:8000"


 

# Test cases with different categories and complexities

TEST_CASES = [

    {

        "category": "Password Reset",

        "priority": "High",

        "description": "User forgot their password and cannot log in to the system"

    },

    {

        "category": "Email Issues",

        "priority": "Medium",

        "description": "Cannot send emails from Outlook client"

    },

    {

        "category": "VPN Access",

        "priority": "High",

        "description": "Unable to connect to company VPN from home"

    },

    {

        "category": "Hardware Request",

        "priority": "Low",

        "description": "Need a new keyboard, current one has broken keys"

    },

    {

        "category": "System Crash",

        "priority": "Critical",

        "description": "Computer keeps crashing and showing blue screen error"

    },

    {

        "category": "Password Reset",

        "priority": "Medium",

        "description": "Need to reset password for email account"

    },

    {

        "category": "Email Issues",

        "priority": "Low",

        "description": "Emails not syncing across devices"

    },

    {

        "category": "VPN Access",

        "priority": "Medium",

        "description": "VPN connection drops frequently"

    },

    {

        "category": "Hardware Request",

        "priority": "High",

        "description": "Monitor is flickering and displaying artifacts"

    },

    {

        "category": "System Crash",

        "priority": "High",

        "description": "Application freezes when opening large files"

    }

]


 

def test_rag_system():

    """Run test cases and evaluate"""

   

    print("\n" + "=" * 70)

    print("  🧪 TESTING RAG SYSTEM")

    print("=" * 70)

   

    print(f"\n  Running {len(TEST_CASES)} test cases...\n")

   

    success_count = 0

   

    for i, test_case in enumerate(TEST_CASES, 1):

        print(f"  Test {i}/{len(TEST_CASES)}: {test_case['category']} - {test_case['priority']}")

       

        try:

            # Call RAG API

            response = requests.post(

                f"{BASE_URL}/api/suggest-resolution",

                json=test_case,

                timeout=30

            )

           

            if response.status_code == 200:

                result = response.json()

               

                # Evaluate

                evaluation = evaluator.evaluate_end_to_end(

                    query=test_case,

                    response=result

                )

               

                print(f"    ✅ Success | Score: {evaluation['combined_score']:.4f} | Grade: {evaluation['grade']}")

                success_count += 1

            else:

                print(f"    ❌ Failed | Status: {response.status_code}")

       

        except Exception as e:

            print(f"    ❌ Error: {str(e)[:50]}")

   

    print(f"\n  Completed: {success_count}/{len(TEST_CASES)} successful\n")

   

    # Print summary

    evaluator.print_summary()

   

    # Export results

    filename = evaluator.export_results()

    print(f"  💾 Results exported to: {filename}\n")


 

def test_single_query():

    """Test a single query interactively"""

   

    print("\n" + "=" * 70)

    print("  🧪 SINGLE QUERY TEST")

    print("=" * 70 + "\n")

   

    category = input("  Category: ") or "Password Reset"

    priority = input("  Priority: ") or "High"

    description = input("  Description: ") or "User forgot password"

   

    test_case = {

        "category": category,

        "priority": priority,

        "description": description

    }

   

    print(f"\n  Testing...")

   

    try:

        response = requests.post(

            f"{BASE_URL}/api/suggest-resolution",

            json=test_case,

            timeout=30

        )

       

        if response.status_code == 200:

            result = response.json()

           

            print("\n  ✅ Response received!")

            print(f"\n  Confidence: {result['confidence']:.4f}")

            print(f"  Similar tickets: {len(result['similar_tickets'])}")

           

            # Evaluate

            evaluation = evaluator.evaluate_end_to_end(

                query=test_case,

                response=result

            )

           

            print(f"\n  📊 EVALUATION:")

            print(f"    Precision@K:       {evaluation['retrieval_metrics']['precision_at_k']:.4f}")

            print(f"    Quality Score:     {evaluation['generation_metrics']['quality_score']:.4f}")

            print(f"    Combined Score:    {evaluation['combined_score']:.4f}")

            print(f"    Grade:             {evaluation['grade']}")

           

            print(f"\n  📝 Resolution:")

            print(f"  {result['suggested_resolution'][:500]}...")

           

        else:

            print(f"\n  ❌ Error: Status {response.status_code}")

   

    except Exception as e:

        print(f"\n  ❌ Error: {e}")


 

if __name__ == "__main__":

    import sys

   

    print("\n" + "=" * 70)

    print("  RAG SYSTEM EVALUATION")

    print("=" * 70)

   

    if len(sys.argv) > 1 and sys.argv[1] == "single":

        test_single_query()

    else:

        test_rag_system()


 