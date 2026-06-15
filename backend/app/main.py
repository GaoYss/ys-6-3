from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import dishes, finance, supply
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FIELD_LABELS = {
    "dish_id": "关联菜品",
    "name": "名称",
    "serving_size": "出品量",
    "sale_price": "售价",
    "ingredient_cost": "原料成本",
    "packaging_cost": "包装/损耗成本",
    "category": "分类",
    "flavor": "口味",
    "status": "状态",
    "description": "描述",
}


def _translate_error(err: dict) -> str:
    loc = err.get("loc", [])
    field = loc[-1] if loc else "字段"
    label = FIELD_LABELS.get(field, field)
    err_type = err.get("type", "")
    ctx = err.get("ctx", {})

    if err_type == "string_too_short":
        min_len = ctx.get("min_length", 1)
        return f"{label}不能为空，至少需要 {min_len} 个字符"
    if err_type == "string_too_long":
        max_len = ctx.get("max_length", 0)
        return f"{label}过长，最多 {max_len} 个字符"
    if err_type == "greater_than_equal":
        ge = ctx.get("ge", 0)
        return f"{label}不能小于 {ge}"
    if err_type == "greater_than":
        gt = ctx.get("gt", 0)
        return f"{label}必须大于 {gt}"
    if err_type == "less_than_equal":
        le = ctx.get("le", 0)
        return f"{label}不能大于 {le}"
    if err_type == "less_than":
        lt = ctx.get("lt", 0)
        return f"{label}必须小于 {lt}"
    if err_type in ("float_parsing", "int_parsing"):
        return f"{label}必须是有效数字"
    if err_type == "missing":
        return f"请填写{label}"
    if err_type == "string_pattern_mismatch":
        pattern = ctx.get("pattern", "")
        if pattern == "^(active|paused|seasonal)$":
            return f"{label}必须是在售、停售或季节限定之一"
        return f"{label}格式不正确"
    return f"{label}：{err.get('msg', '格式不正确')}"


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    messages = [_translate_error(err) for err in exc.errors()]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "；".join(messages) if messages else "输入数据有误",
            "field_errors": [
                {
                    "field": (err.get("loc") or ["未知"])[-1],
                    "message": _translate_error(err),
                }
                for err in exc.errors()
            ],
        },
    )


app.include_router(dishes.router, prefix=settings.api_prefix)
app.include_router(supply.router, prefix=settings.api_prefix)
app.include_router(finance.router, prefix=settings.api_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

