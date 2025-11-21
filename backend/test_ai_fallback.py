"""
Test script to verify AI fallback functionality when no similar tickets are found.
"""

import os
import sys
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import RAG engine
from rag_engine_tfidf import RAGEngine


def test_ai_fallback():
    """Test AI fallback when no similar tickets are found."""

    print("\n" + "=" * 80)
    print("🧪 TESTING AI FALLBACK FEATURE")
    print("=" * 80 + "\n")

    # Initialize RAG engine
    logger.info("Initializing RAG engine...")
    rag_engine = RAGEngine()

    if not rag_engine.is_ready():
        logger.error("❌ RAG engine not ready. Please build knowledge base first.")
        return

    logger.info(
        f"✅ Knowledge base loaded with {rag_engine.get_knowledge_base_size()} tickets"
    )
    logger.info(f"✅ AI available: {rag_engine.has_ai_client()}")

    # Test case 1: Query that should have similar tickets
    print("\n" + "-" * 80)
    print("Test 1: Normal query (should find similar tickets)")
    print("-" * 80)

    result1 = rag_engine.suggest_resolution(
        category="Password Reset",
        priority="Medium",
        description="I forgot my password and cannot login to my account",
    )

    print(f"\n📊 Method: {result1['method']}")
    print(f"📊 Confidence: {result1['confidence']:.2%}")
    print(f"📊 Similar tickets found: {len(result1['similar_tickets'])}")
    print(f"📊 Total time: {result1['timing']['total_time_ms']:.2f}ms")
    print(f"\n💡 Resolution:\n{result1['suggested_resolution'][:500]}...")

    # Test case 2: Highly unusual query (should trigger AI fallback)
    print("\n" + "-" * 80)
    print("Test 2: Unusual query (should trigger AI fallback)")
    print("-" * 80)

    result2 = rag_engine.suggest_resolution(
        category="Hardware Request",
        priority="High",
        description="My quantum flux capacitor is experiencing temporal displacement anomalies when interfacing with the hyperspace bypass circuit",
    )

    print(f"\n📊 Method: {result2['method']}")
    print(f"📊 Confidence: {result2['confidence']:.2%}")
    print(f"📊 Similar tickets found: {len(result2['similar_tickets'])}")
    print(f"📊 Total time: {result2['timing']['total_time_ms']:.2f}ms")

    if "metadata" in result2:
        print(f"📊 AI Generated: {result2['metadata'].get('ai_generated', False)}")
        print(f"📊 Model: {result2['metadata'].get('model', 'N/A')}")

    print(f"\n💡 Resolution:\n{result2['suggested_resolution'][:800]}...")

    # Test case 3: Another edge case
    print("\n" + "-" * 80)
    print("Test 3: Specific technical issue (testing AI quality)")
    print("-" * 80)

    result3 = rag_engine.suggest_resolution(
        category="System Crash",
        priority="Critical",
        description="My custom Node.js application crashes with ECONNREFUSED error when trying to connect to MongoDB Atlas cluster after recent network configuration changes",
    )

    print(f"\n📊 Method: {result3['method']}")
    print(f"📊 Confidence: {result3['confidence']:.2%}")
    print(f"📊 Similar tickets found: {len(result3['similar_tickets'])}")
    print(f"📊 Total time: {result3['timing']['total_time_ms']:.2f}ms")

    if "metadata" in result3:
        print(f"📊 AI Generated: {result3['metadata'].get('ai_generated', False)}")

    print(f"\n💡 Resolution:\n{result3['suggested_resolution'][:800]}...")

    print("\n" + "=" * 80)
    print("✅ AI FALLBACK TESTS COMPLETED")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    try:
        test_ai_fallback()
    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)
        sys.exit(1)
