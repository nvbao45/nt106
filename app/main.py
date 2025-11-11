from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)
from app.schemas.user.users import UserCreate
from app.db.repository.users import create_new_user

from app.api.v1.auth import auth_router
from app.api.v1.users import user_router
from app.api.v1.monan import monan_router
from app.db.session import engine, database, get_db
from app.db.base_class import Base
from app.core.config import settings


drop_db = False

if drop_db:
    Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Hôm nay ăn gì",
    openapi_url=f"/openapi.json", 
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css",
    )

@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()

@app.get("/redoc", include_in_schema=False)
@app.get("/", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=app.openapi_url,
        title=app.title + " - ReDoc",
        redoc_js_url="https://unpkg.com/redoc@next/bundles/redoc.standalone.js",
    )

@app.on_event("startup")
async def startup():
    await database.connect()
    if drop_db:
        create_new_user(
            UserCreate(
                username="baonv",
                email="baonv@uit.edu.vn",
                password="BaoNV123",
            ),
            next(get_db())
        )

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="API cho bài 'Hôm nay ăn gì' - NT106",
        version=settings.VERSION,
        description="Đây là API cho bài 'Hôm nay ăn gì' thực hành môn NT106-Lập trình mạng căn bản",
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
            "url": "https://nc.uit.edu.vn/wp-content/uploads/2019/08/logoncuit-foot-1.png"
    }
    openapi_schema["info"]["contact"] = {
            "name": "Nguyễn Văn Bảo",
            "email": "baonv@uit.edu.vn"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi


app.include_router(auth_router, prefix=f"/auth", tags=["Authentication"])
app.include_router(user_router, prefix=f"/api/{settings.VERSION}/user", tags=["User"])
app.include_router(monan_router, prefix=f"/api/{settings.VERSION}/monan", tags=["Mon An"])