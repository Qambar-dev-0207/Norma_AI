from pydantic import BaseModel, Field, EmailStr, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from pydantic_core import core_schema
from typing import Optional, List, Annotated, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, _source_type: Any, _handler: Any
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(
        cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return handler(core_schema.str_schema())

class UserBase(BaseModel):
    phone_number: str
    name: str
    email: Optional[EmailStr] = None
    role: str = "patient" # patient | doctor | receptionist | admin
    status: str = "active"

class UserCreate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

import uuid

class PatientBase(BaseModel):
    patient_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone_number: str # international format
    email: Optional[EmailStr] = None
    date_of_birth: Optional[datetime] = None
    gender: str = "Other" # Male, Female, Other, Prefer not to say
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    preferred_language: str = "ar" # ar/en
    first_visit_date: Optional[datetime] = None
    last_visit_date: Optional[datetime] = None
    total_visits: int = 0
    medical_alerts: List[str] = [] # allergies, chronic conditions
    insurance_provider: Optional[str] = None
    insurance_id: Optional[str] = None
    notes: Optional[str] = None
    created_by: Optional[PyObjectId] = None
    is_active: bool = True

class Patient(PatientBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class DoctorBase(BaseModel):
    doctor_uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    full_name_ar: Optional[str] = None
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    whatsapp_number: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    consultation_fee: float = 0.0
    bio: Optional[str] = None
    bio_ar: Optional[str] = None
    photo_url: Optional[str] = None
    google_calendar_id: Optional[str] = None
    is_active: bool = True

class Doctor(DoctorBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class OperatingHoursBase(BaseModel):
    doctor_id: Optional[PyObjectId] = None # NULL for clinic-wide
    day_of_week: int # 0=Sunday, 6=Saturday
    is_open: bool = True
    open_time: Optional[str] = None # HH:MM
    close_time: Optional[str] = None
    break_start_time: Optional[str] = None
    break_end_time: Optional[str] = None
    notes: Optional[str] = None
    effective_from: datetime = Field(default_factory=datetime.utcnow)
    effective_until: Optional[datetime] = None

class OperatingHours(OperatingHoursBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AppointmentBase(BaseModel):
    patient_id: PyObjectId
    doctor_id: PyObjectId
    clinic_id: Optional[PyObjectId] = None
    scheduled_at: datetime
    status: str = "booked" # booked | rescheduled | canceled | completed
    reason: Optional[str] = None
    source: str = "dashboard" # dashboard | whatsapp | admin | staff
    notes: Optional[str] = None
    created_by: Optional[PyObjectId] = None

class Appointment(AppointmentBase):
    id: Annotated[PyObjectId, Field(default_factory=PyObjectId, alias="_id")]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
