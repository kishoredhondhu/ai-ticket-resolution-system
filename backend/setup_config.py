"""

Setup Configuration

Creates .env file with Azure credentials.

"""


 

import os


 

def create_env_file():

    """Create .env file with configuration."""

    env_content = """# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://ag-new-endpoint.openai.azure.com
AZURE_OPENAI_KEY=your-api-key-here
AZURE_OPENAI_API_VERSION=2025-01-01-preview
AZURE_OPENAI_DEPLOYMENT=gpt-4.1

# RAG Configuration
TOP_K_SIMILAR=5
MIN_SIMILARITY=0.6

# Service Configuration
PORT=8000
"""

   

    with open('.env', 'w') as f:

        f.write(env_content)

   

    print("✓ .env file created successfully")

    print("\nConfiguration written to .env (edit values as needed):")
    print("  AZURE_OPENAI_ENDPOINT=")
    print("  AZURE_OPENAI_KEY=")
    print("  AZURE_OPENAI_API_VERSION=2025-01-01-preview")
    print("  AZURE_OPENAI_DEPLOYMENT=gpt-4.1")
    print("  TOP_K_SIMILAR=5")
    print("  MIN_SIMILARITY=0.6")
    print("  PORT=8000")


 

if __name__ == "__main__":

    print("="*60)

    print("CREATING RAG SERVICE CONFIGURATION")

    print("="*60)

    print()

   

    create_env_file()

   

    print("\n✅ Setup complete!")

    print("\nNext step: python scripts\\build_knowledge_base_tfidf.py")


 