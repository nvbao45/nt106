import httpx
import os
from fastapi import APIRouter, Request, Response
from fastapi.responses import PlainTextResponse

# Proxy UI routes to Next.js dev server
# In Docker, use service name; locally use localhost
NEXT_JS_BASE = os.getenv("NEXT_JS_URL", "http://localhost:3000")

ui_router = APIRouter()

@ui_router.api_route("/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"], include_in_schema=False)
async def proxy_ui(full_path: str, request: Request):
    """Proxy requests to Next.js dev server"""
    
    target_url = f"{NEXT_JS_BASE}/{full_path}" if full_path else NEXT_JS_BASE + "/"

    # Prepare request
    method = request.method
    headers = dict(request.headers)
    headers.pop('host', None)  # Remove host header

    data = None
    if method in ("POST", "PUT", "PATCH"):
        try:
            data = await request.body()
        except Exception:
            data = None

    async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
        try:
            resp = await client.request(method, target_url, headers=headers, content=data)
        except httpx.RequestError as e:
            return PlainTextResponse(f"Next.js dev server unreachable at {NEXT_JS_BASE}: {str(e)}", status_code=502)

    # Build response
    excluded_headers = ["content-encoding", "transfer-encoding", "connection"]
    response_headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded_headers}
    
    return Response(
        content=resp.content,
        status_code=resp.status_code,
        headers=response_headers,
        media_type=resp.headers.get('content-type')
    )
