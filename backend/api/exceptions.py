from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str


class UserAlreadyExistsResponse(ErrorResponse):
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "User already exists."
            }
        }


class UserNotFoundResponse(ErrorResponse):
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "User not found."
            }
        }


class InsufficientFundsResponse(ErrorResponse):
    class Config:
        json_schema_extra = {
            "example": {"detail": "User does not have enough funds."}
        }

class AssetNotFoundResponse(ErrorResponse):
    class Config:
        json_schema_extra = {
            "example": {"detail": "Asset not found."}
        }


class AssetUserNotFoundResponse(ErrorResponse):
    class Config:
        json_schema_extra = {
            "example": {"detail": "Asset or user not found."}
        }
