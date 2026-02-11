import os
import json
import asyncio
from contextlib import asynccontextmanager
from fastapi import APIRouter, HTTPException
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv

load_dotenv()

# Configuration
JIRA_URL = os.getenv("JIRA_URL")
JIRA_USERNAME = os.getenv("JIRA_USERNAME")
JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")

# Global session
session: ClientSession | None = None
mcp_router = APIRouter()

async def run_mcp_server():
    """
    Connects to the MCP server using stdio.
    """
    # Define server parameters
    # Assuming 'uvx' or 'npx' is available in path.
    # The command should match what is in cline_mcp_settings.json usually.
    # Since we couldn't find it, we default to running the atlassian server directly.
    
    server_params = StdioServerParameters(
        command="npx",
        args=["-y", "@modelcontextprotocol/server-atlassian"],
        env={
            "JIRA_URL": JIRA_URL or "",
            "JIRA_USERNAME": JIRA_USERNAME or "",
            "JIRA_API_TOKEN": JIRA_API_TOKEN or "",
            **os.environ
        }
    )
    
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as s:
            global session
            session = s
            print("Connected to MCP Server")
            # Keep the connection alive
            await s.initialize()
            
            # Keep running until cancelled
            # In a real app, we might need a more robust way to handle the lifespan
            # integration with FastAPI lifespan.
            # Here we just wait forever, but this blocks the lifespan startup if awaited directly?
            # No, we should run this in background or manage session differently.
            # For simplicity in this demo, we will use a global session that creates a task?
            # Actually, stdio_client is a context manager. We need to keep it open.
            
            # Better approach: Start a background task that runs the client loop.
            # But the client loop needs to be accessible.
            pass

# Since asyncio context managers are tricky to keep open in global scope,
# we will use a slightly different pattern or a persistent process helper.
# For now, let's implement a simpler version where we might restart connection per request 
# OR use a proper client manager. 
# Given the complexity, let's start with a simpler "connect on startup" approach if possible,
# or just re-structure.

# REVISED APPROACH:
# We'll use a class to manage the session.
class MCPSessionManager:
    def __init__(self):
        self.session = None
        self.exit_stack = None

    async def start(self):
        # Configure env
        env = os.environ.copy()
        if JIRA_URL: env["JIRA_URL"] = JIRA_URL
        if JIRA_USERNAME: env["JIRA_USERNAME"] = JIRA_USERNAME
        if JIRA_API_TOKEN: env["JIRA_API_TOKEN"] = JIRA_API_TOKEN

        server_params = StdioServerParameters(
            command="npx", # Ensure npx is in PATH
            args=["-y", "@modelcontextprotocol/server-atlassian"],
            env=env
        )
        
        self.transport = await stdio_client(server_params).__aenter__()
        self.read, self.write = self.transport
        self.session = ClientSession(self.read, self.write)
        await self.session.__aenter__()
        await self.session.initialize()
        print("MCP Session Initialized")

    async def stop(self):
        if self.session:
            await self.session.__aexit__(None, None, None)
        # if self.transport:
        #    await self.transport.__aexit__(None, None, None) 
        # stdio_client returns (read, write), it's a context manager itself.
        # We need to manually call __aexit__ on the context manager object.
        # This is getting complicated to do manually.
        # Let's stick to the official way: context manager.
        pass

# Actually, the python SDK encourages context managers.
# We can use lifespan to holding the connection.
# But `stdio_client` is an async context manager.
# To keep it open during app life, we can use `contextlib.AsyncExitStack`.

from contextlib import AsyncExitStack

exit_stack = AsyncExitStack()

@asynccontextmanager
async def lifespan(app: FastAPI):
    global session
    try:
        # Configure env
        env = os.environ.copy()
        if JIRA_URL: env["JIRA_URL"] = JIRA_URL
        if JIRA_USERNAME: env["JIRA_USERNAME"] = JIRA_USERNAME
        if JIRA_API_TOKEN: env["JIRA_API_TOKEN"] = JIRA_API_TOKEN

        # Verified connection using uvx
        import shutil
        command = shutil.which("uvx") or "uvx"
        # If uvx is not found, fallback to npx or let it fail? 
        # Given the test verified uvx works, we prefer it.
        # But for robustness, if uvx fails, we might check npx? 
        # For now, stick to what works.
        
        server_params = StdioServerParameters(
            command=command,
            args=["--python", "3.12", "mcp-atlassian"],
            env=env
        )
        
        # Enter stdio_client context
        read, write = await exit_stack.enter_async_context(stdio_client(server_params))
        
        # Enter ClientSession context
        session = await exit_stack.enter_async_context(ClientSession(read, write))
        
        await session.initialize()
        print("MCP Client Connected to Atlassian Server")
        
        yield
        
    finally:
        print("Closing MCP Client...")
        await exit_stack.aclose()

@mcp_router.get("/tools")
async def list_tools():
    if not session:
        raise HTTPException(status_code=503, detail="MCP Session not active")
    result = await session.list_tools()
    return result

@mcp_router.post("/tools/{tool_name}")
async def call_tool(tool_name: str, arguments: dict):
    if not session:
        raise HTTPException(status_code=503, detail="MCP Session not active")
    result = await session.call_tool(tool_name, arguments=arguments)
    return result
