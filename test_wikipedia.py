"""
Test Wikipedia API to diagnose issues
"""
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper

print("Testing Wikipedia API...\n")
print("="*60)

# Test 1: Basic Wikipedia search
print("\n1. Testing basic Wikipedia search for 'cancer':")
try:
    wikipedia = WikipediaQueryRun(
        api_wrapper=WikipediaAPIWrapper(
            top_k_results=1,
            doc_content_chars_max=500,
            lang="en"
        )
    )
    result = wikipedia.run("cancer")
    print("✅ SUCCESS!")
    print(f"Result preview: {result[:200]}...")
except Exception as e:
    print(f"❌ FAILED: {e}")
    print(f"Error type: {type(e).__name__}")

# Test 2: Try with different query
print("\n" + "="*60)
print("\n2. Testing Wikipedia search for 'diabetes':")
try:
    wikipedia = WikipediaQueryRun(
        api_wrapper=WikipediaAPIWrapper(
            top_k_results=1,
            doc_content_chars_max=500
        )
    )
    result = wikipedia.run("diabetes")
    print("✅ SUCCESS!")
    print(f"Result preview: {result[:200]}...")
except Exception as e:
    print(f"❌ FAILED: {e}")
    print(f"Error type: {type(e).__name__}")

# Test 3: Direct Wikipedia API test
print("\n" + "="*60)
print("\n3. Testing direct Wikipedia package:")
try:
    import wikipedia
    print(f"Wikipedia package version: {wikipedia.__version__ if hasattr(wikipedia, '__version__') else 'unknown'}")
    summary = wikipedia.summary("cancer", sentences=2)
    print("✅ SUCCESS!")
    print(f"Summary: {summary}")
except ImportError:
    print("❌ Wikipedia package not installed")
    print("Install with: pip install wikipedia")
except Exception as e:
    print(f"❌ FAILED: {e}")
    print(f"Error type: {type(e).__name__}")

# Test 4: Check network connectivity
print("\n" + "="*60)
print("\n4. Testing network connectivity to Wikipedia:")
try:
    import requests
    response = requests.get("https://en.wikipedia.org/wiki/Cancer", timeout=5)
    print(f"✅ SUCCESS! Status code: {response.status_code}")
except Exception as e:
    print(f"❌ FAILED: {e}")
    print("Network connectivity issue detected")

print("\n" + "="*60)
print("\nDiagnosis complete!")
