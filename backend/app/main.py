import os
from contextlib import asynccontextmanager
from datetime import date
from typing import Literal

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import Boolean, Date, Integer, String, Text, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./brujula-dev.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite:") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(24), nullable=False, index=True)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    topic: Mapped[str | None] = mapped_column(String(100), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)


class ActivityCreate(BaseModel):
    description: str = Field(min_length=1, max_length=500)
    category: Literal["professional", "academic", "personal"]
    date: date
    topic: str | None = Field(default=None, max_length=100)
    due_date: date | None = None


class ActivityPatch(BaseModel):
    done: bool


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    description: str
    category: str
    date: date
    topic: str | None
    due_date: date | None
    done: bool


def get_session():
    with SessionLocal() as session:
        yield session


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Brújula API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health(session: Session = Depends(get_session)):
    session.execute(select(1))
    return {"status": "ok", "database": "connected"}


@app.get("/api/activities", response_model=list[ActivityRead])
def list_activities(session: Session = Depends(get_session)):
    return session.scalars(select(Activity).order_by(Activity.date.desc(), Activity.id.desc())).all()


@app.post("/api/activities", response_model=ActivityRead, status_code=201)
def create_activity(payload: ActivityCreate, session: Session = Depends(get_session)):
    item = Activity(**payload.model_dump())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


@app.patch("/api/activities/{activity_id}", response_model=ActivityRead)
def update_activity(activity_id: int, payload: ActivityPatch, session: Session = Depends(get_session)):
    item = session.get(Activity, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    item.done = payload.done
    session.commit()
    session.refresh(item)
    return item


@app.delete("/api/activities/{activity_id}", status_code=204)
def delete_activity(activity_id: int, session: Session = Depends(get_session)):
    item = session.get(Activity, activity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Actividad no encontrada")
    session.delete(item)
    session.commit()
    return Response(status_code=204)
