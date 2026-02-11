import os
import json
from openai import AsyncOpenAI
import mcp_client

# Initialize OpenAI Client for GitHub Models
# Endpoint: https://models.inference.ai.azure.com
# Model: gpt-4o
client = AsyncOpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.getenv("GITHUB_TOKEN") or os.getenv("OPENAI_API_KEY") # Fallback or specific token
)

SYSTEM_PROMPT = """You are a helpful Jira Chatbot. You have access to a set of tools to interact with Jira. 
You can search for issues, create issues, update them, look for transitions, etc.
Always look for the most relevant tool for the user's request. 
If the user asks to "create a bug", use the `jira_create_issue` tool. 
If the user asks to "find issues", use `jira_search` or `jira_search_fields`.
When a tool returns a result, summarize it for the user in a friendly way.
If you need more information to call a tool (like project key, issue type), ask the user.
"""

async def chat_with_llm(messages: list):
    """
    Orchestrates the chat:
    1. Fetches available tools from MCP session.
    2. Sends messages + tools to OpenAI (GitHub Models).
    3. If LLM calls a tool, execute it via MCP session.
    4. Recursively send results back until a final text response is generated.
    """
    try:
        if not mcp_client.session:
            return {"role": "assistant", "content": "Error: MCP Session is not connected."}

        # 1. Get Tools
        mcp_tools = await mcp_client.session.list_tools()
        openai_tools = [convert_mcp_tool_to_openai(t) for t in mcp_tools.tools]

        # 2. Call LLM
        current_messages = list(messages)
        if current_messages[0]["role"] != "system":
            current_messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

        # Limit loop to prevent infinite loops
        for _ in range(5):
            response = await client.chat.completions.create(
                model="gpt-4o",  # Standard model available via GitHub Models
                messages=current_messages,
                tools=openai_tools,
                tool_choice="auto"
            )

            message = response.choices[0].message
            current_messages.append(message)

            if message.tool_calls:
                # 3. Execute Tools
                for tool_call in message.tool_calls:
                    tool_name = tool_call.function.name
                    tool_args = json.loads(tool_call.function.arguments)
                    
                    print(f"Executing tool: {tool_name} with args: {tool_args}")
                    
                    try:
                        result = await mcp_client.session.call_tool(tool_name, tool_args)
                        
                        # MCP returns a list of content
                        content_str = ""
                        for content in result.content:
                            if content.type == "text":
                                content_str += content.text
                            elif content.type == "resource": 
                                 content_str += f"[Resource: {content.uri}]\n"
                            else:
                                content_str += str(content)

                        current_messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": content_str
                        })
                    except Exception as e:
                        current_messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": f"Error calling tool {tool_name}: {str(e)}"
                        })
                # Continue loop
            else:
                # No more tool calls, return final response
                return {"role": "assistant", "content": message.content}
    
        return {"role": "assistant", "content": "I'm sorry, I got stuck in a loop trying to process your request."}
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"role": "assistant", "content": f"Error in orchestrator: {str(e)}"}

def convert_mcp_tool_to_openai(tool):
    """
    Converts an MCP Tool object to OpenAI's tool format.
    """
    return {
        "type": "function",
        "function": {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.inputSchema
        }
    }

def sanitize_schema(schema):
    """
    Recursively removes fields not supported by Gemini's Schema protobuf.
    """
    if not isinstance(schema, dict):
        return

    # Remove 'default' if present
    if "default" in schema:
        del schema["default"]
    
    # Remove strict unsupported fields
    unsupported_fields = [
        "default", "title", 
        "anyOf", "allOf", "oneOf",
        "maximum", "minimum", "exclusiveMaximum", "exclusiveMinimum",
        "maxLength", "minLength", "pattern",
        "maxItems", "minItems", "uniqueItems",
        "maxProperties", "minProperties", "additionalProperties",
        "const", "not"
    ]
    
    for field in unsupported_fields:
        if field in schema:
            del schema[field]
            # If type is missing after deletion (e.g. anyOf removal), default to string
            if "type" not in schema and field in ["anyOf", "allOf", "oneOf"]:
                schema["type"] = "string"

    # Recurse into properties
    if "properties" in schema:
        for prop in schema["properties"].values():
            sanitize_schema(prop)
            
    # Recurse into items (for arrays)
    if "items" in schema:
        sanitize_schema(schema["items"])

