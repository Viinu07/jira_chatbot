import httpx
import asyncio

async def main():
    try:
        print("Checking Health...")
        async with httpx.AsyncClient() as client:
            resp = await client.get("http://127.0.0.1:8000/health")
            print(f"Health: {resp.status_code} {resp.text}")
            
            print("Checking Tools...")
            resp = await client.get("http://127.0.0.1:8000/api/tools")
            print(f"Tools: {resp.status_code}")
            if resp.status_code == 200:
                print(f"Tool count: {len(resp.json().get('tools', []))}")
            else:
                print(f"Error: {resp.text}")

            print("Testing Chat Endpoint...")
            try:
                chat_resp = await client.post("http://127.0.0.1:8000/api/chat", json={
                    "messages": [{"role": "user", "content": "Hello"}]
                }, timeout=30.0) # increased timeout for OpenAI
                if chat_resp.status_code == 200:
                    print(f"Chat Response: {chat_resp.json()}")
                else:
                    print(f"Chat Error: {chat_resp.status_code} {chat_resp.text}")
            except Exception as e:
                print(f"Chat Request Failed: {e}")

    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
