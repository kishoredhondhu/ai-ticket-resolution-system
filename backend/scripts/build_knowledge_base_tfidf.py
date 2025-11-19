"""

Build Knowledge Base - TF-IDF Version

Uses TF-IDF similarity instead of embeddings (no embedding API needed!)

"""


 

import argparse
import os
import sys
import pandas as pd
import pickle
import numpy as np
from pathlib import Path
from tqdm import tqdm
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def _detect_columns(df):
    """Detect and map required columns from a variety of common headers.

    Returns a dict mapping canonical names to actual df column names.
    Raises ValueError if any required column is missing.
    """
    cols = [c.strip().lower().replace(" ", "_") for c in df.columns]
    colset = set(cols)

    candidates = {
        "category": [
            "category", "categories", "type", "issue_type", "ticket_category",
        ],
        "description": [
            "description", "ticket_description", "issue", "issue_description",
            "problem", "summary", "details", "text",
        ],
        "resolution": [
            "resolution", "solution", "fix", "steps", "resolution_notes",
            "answer", "workaround",
        ],
        # Optional
        "ticket_id": ["ticket_id", "id", "ticketid", "case_id", "incident_id"],
        "priority": ["priority", "severity", "prio"],
        "status": ["status", "state"],
    }

    mapping = {}
    missing = []
    for required in ["category", "description", "resolution"]:
        found = next((c for c in candidates[required] if c in colset), None)
        if not found:
            missing.append(required)
        else:
            mapping[required] = found

    # Optional fields
    for opt in ["ticket_id", "priority", "status"]:
        found = next((c for c in candidates[opt] if c in colset), None)
        if found:
            mapping[opt] = found

    if missing:
        raise ValueError(
            "Missing required columns: "
            + ", ".join(missing)
            + f". Available columns: {list(colset)}"
        )

    return mapping


 # Load environment
load_dotenv()


 

def load_tickets_from_excel(excel_path):

    """Load tickets from Excel file."""

    print(f"Loading tickets from: {excel_path}")

   

    if not os.path.exists(excel_path):

        print(f"❌ File not found: {excel_path}")

        return None

   

    df = pd.read_excel(excel_path)

   

    # Normalize column names
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    # Detect and rename columns to canonical names
    try:
        mapping = _detect_columns(df)
        df = df.rename(columns={v: k for k, v in mapping.items()})
    except ValueError as e:
        print(f"❌ Column detection error: {e}")
        return None

   

    print(f"✓ Loaded {len(df)} tickets")

    print(f"  Columns: {list(df.columns)}")

   

    return df


 

def build_knowledge_base_tfidf(df):

    """Build knowledge base using TF-IDF vectors."""

    print("\n" + "="*60)

    print("BUILDING KNOWLEDGE BASE (TF-IDF)")

    print("="*60)

   

    tickets = []

    texts = []

   

    # Prepare ticket data

    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing tickets"):

        ticket = {

            'ticket_id': row.get('ticket_id', f'T-{len(tickets)+1}'),

            'category': str(row['category']),

            'description': str(row['description']),

            'resolution': str(row['resolution']),

            'priority': str(row.get('priority', 'Medium')),

            'status': str(row.get('status', 'Resolved'))

        }

       

        # Create combined text for TF-IDF

        combined_text = f"{ticket['category']} {ticket['description']}"

       

        tickets.append(ticket)

        texts.append(combined_text)

   

    print(f"\n✓ Processed {len(tickets)} tickets")

   

    # Create TF-IDF vectorizer

    print("\nBuilding TF-IDF index...")

    vectorizer = TfidfVectorizer(

        max_features=5000,

        ngram_range=(1, 2),

        stop_words='english'

    )

   

    tfidf_matrix = vectorizer.fit_transform(texts)

   

    print(f"✓ TF-IDF matrix shape: {tfidf_matrix.shape}")

    print(f"✓ Vocabulary size: {len(vectorizer.vocabulary_)}")

   

    return tickets, vectorizer, tfidf_matrix


 

def save_knowledge_base(tickets, vectorizer, tfidf_matrix, output_path):

    """Save knowledge base to disk."""

    # Create data directory

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

   

    data = {

        'tickets': tickets,

        'vectorizer': vectorizer,

        'tfidf_matrix': tfidf_matrix

    }

   

    with open(output_path, 'wb') as f:

        pickle.dump(data, f)

   

    file_size = os.path.getsize(output_path) / (1024 * 1024)  # MB

    print(f"\n✓ Knowledge base saved to: {output_path}")

    print(f"  File size: {file_size:.2f} MB")

    print(f"  Total tickets: {len(tickets)}")


 

def validate_knowledge_base(output_path):

    """Validate the knowledge base."""

    print("\n" + "="*60)

    print("VALIDATING KNOWLEDGE BASE")

    print("="*60)

   

    with open(output_path, 'rb') as f:

        data = pickle.load(f)

   

    tickets = data['tickets']

    vectorizer = data['vectorizer']

    tfidf_matrix = data['tfidf_matrix']

   

    print(f"✓ Tickets: {len(tickets)}")

    print(f"✓ TF-IDF matrix shape: {tfidf_matrix.shape}")

    print(f"✓ Vocabulary size: {len(vectorizer.vocabulary_)}")

   

    # Sample ticket

    if tickets:

        print("\nSample ticket:")

        sample = tickets[0]

        print(f"  ID: {sample['ticket_id']}")

        print(f"  Category: {sample['category']}")

        print(f"  Description: {sample['description'][:100]}...")

        print(f"  Resolution: {sample['resolution'][:100]}...")

   

    # Category distribution

    categories = {}

    for ticket in tickets:

        cat = ticket['category']

        categories[cat] = categories.get(cat, 0) + 1

   

    print(f"\nTop 5 categories:")

    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)

    for cat, count in sorted_cats[:5]:

        print(f"  {cat}: {count}")

   

    # Test similarity search

    print("\n" + "="*60)

    print("TESTING SIMILARITY SEARCH")

    print("="*60)

   

    test_query = "Cannot connect to Wi-Fi network"

    print(f"\nTest query: '{test_query}'")

   

    query_vec = vectorizer.transform([test_query])

    similarities = cosine_similarity(query_vec, tfidf_matrix)[0]

    top_5_indices = similarities.argsort()[-5:][::-1]

   

    print("\nTop 5 similar tickets:")

    for i, idx in enumerate(top_5_indices, 1):

        ticket = tickets[idx]

        score = similarities[idx]

        print(f"\n{i}. Similarity: {score:.3f}")

        print(f"   Category: {ticket['category']}")

        print(f"   Description: {ticket['description'][:80]}...")


 

def main():

    print("="*60)

    print("BUILD KNOWLEDGE BASE FOR RAG SERVICE (TF-IDF)")

    print("="*60)

    print()

   

    # Resolve backend root: this file is backend/scripts/...
    scripts_dir = Path(__file__).resolve().parent
    backend_root = scripts_dir.parent

    parser = argparse.ArgumentParser(description="Build TF-IDF knowledge base from Excel file")
    parser.add_argument(
        "--excel",
        dest="excel",
        type=str,
        default=str(backend_root / "data" / "Sample-Data.xlsx"),
        help="Path to Excel tickets file (default: backend/data/Sample-Data.xlsx)",
    )
    parser.add_argument(
        "--output",
        dest="output",
        type=str,
        default=str(backend_root / "data" / "knowledge_base.pkl"),
        help="Output pickle path (default: backend/data/knowledge_base.pkl)",
    )
    args = parser.parse_args()

    excel_path = args.excel
    output_path = args.output

   

    # Check if tickets file exists

    if not os.path.exists(excel_path):
        print(f"❌ Tickets file not found: {excel_path}")
        print(f"\nCurrent directory: {os.getcwd()}")
        print(f"Looking for: {os.path.abspath(excel_path)}")
        print("Hint: Place your Excel at backend/data/Sample-Data.xlsx or pass --excel <path>.")
        return

   

    # Load tickets

    df = load_tickets_from_excel(excel_path)

    if df is None:

        return

   

    # Build knowledge base using TF-IDF

    tickets, vectorizer, tfidf_matrix = build_knowledge_base_tfidf(df)

   

    # Save knowledge base

    save_knowledge_base(tickets, vectorizer, tfidf_matrix, output_path)

   

    # Validate

    validate_knowledge_base(output_path)

   

    print("\n" + "="*60)

    print("✅ KNOWLEDGE BASE BUILT SUCCESSFULLY!")

    print("="*60)

    print("\n💡 Using TF-IDF similarity (no embeddings needed)")

    print("   This works great for ticket matching!")

    print("\nNext steps:")

    print("  1. Start RAG service: python app.py")

    print("  2. Test API: http://localhost:8000/docs")

    print("  3. Integrate with Java backend")

    print()


 

if __name__ == "__main__":

    main()


 