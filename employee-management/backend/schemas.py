from pydantic import BaseModel, EmailStr, Field


class EmployeeCreate(BaseModel):
    name: str
    role: str
    email: EmailStr
    age: int 
    department: str


class EmployeeUpdate(BaseModel):
    name: str
    role: str
    email: EmailStr
    age: int 
    department: str


class EmployeeResponse(BaseModel):
    id: int
    name: str
    role: str
    email: EmailStr
    age: int
    department: str

    model_config = {"from_attributes": True}