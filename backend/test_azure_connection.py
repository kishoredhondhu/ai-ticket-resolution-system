"""
Test Azure OpenAI connection to diagnose issues
"""
import os
from dotenv import load_dotenv
from openai import AzureOpenAI
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

print("="*80)
print("🔍 TESTING AZURE OPENAI CONNECTION")
print("="*80)

# Check environment variables
endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
api_key = os.getenv("AZURE_OPENAI_KEY")
api_version = os.getenv("AZURE_OPENAI_API_VERSION")
deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")

print(f"\n📋 Configuration:")
print(f"   Endpoint: {endpoint}")
print(f"   API Key: {api_key[:20]}...{api_key[-10:] if api_key else 'None'}")
print(f"   API Version: {api_version}")
print(f"   Deployment: {deployment}")

if not endpoint or not api_key:
    print("\n❌ ERROR: Missing Azure OpenAI credentials!")
    print("   Please check your .env file")
    exit(1)

print("\n🔌 Attempting to connect to Azure OpenAI...")

try:
    # Remove proxy settings
    proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy']
    for var in proxy_vars:
        if var in os.environ:
            del os.environ[var]
    
    # Initialize client
    client = AzureOpenAI(
        azure_endpoint=endpoint,
        api_key=api_key,
        api_version=api_version
    )
    print("✅ Client initialized successfully")
    
    # Test API call
    print(f"\n🧪 Testing API call with deployment: {deployment}")
    print("   Sending test message...")
    
    response = client.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'Hello, Azure OpenAI is working!' in one sentence."}
        ],
        temperature=0.7,
        max_tokens=50
    )
    
    result = response.choices[0].message.content
    print(f"\n✅ SUCCESS! API Response:")
    print(f"   {result}")
    print("\n🎉 Azure OpenAI connection is working perfectly!")
    
except Exception as e:
    print(f"\n❌ ERROR: {type(e).__name__}")
    print(f"   {str(e)}")
    print("\n📝 Possible issues:")
    print("   1. Invalid API key or endpoint")
    print("   2. Deployment name doesn't match Azure portal")
    print("   3. Network/firewall blocking connection")
    print("   4. API quota exceeded")
    print("   5. Region mismatch")
    print("\n💡 Troubleshooting steps:")
    print("   1. Verify credentials in Azure portal")
    print("   2. Check deployment name matches exactly")
    print("   3. Ensure API key hasn't expired")
    print("   4. Try from Azure portal's playground first")

print("\n" + "="*80)
