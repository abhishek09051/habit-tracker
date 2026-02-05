from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from datetime import date, datetime, timedelta
from typing import List, Optional
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./habits.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    emoji = Column(String, default="⭐")
    created_at = Column(Date, default=date.today)
    completions = relationship("Completion", back_populates="habit", cascade="all, delete-orphan")


class Completion(Base):
    __tablename__ = "completions"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    completed_date = Column(Date, nullable=False)
    habit = relationship("Habit", back_populates="completions")


Base.metadata.create_all(bind=engine)


class HabitCreate(BaseModel):
    name: str
    emoji: str = "⭐"


class HabitUpdate(BaseModel):
    name: str
    emoji: str


class HabitResponse(BaseModel):
    id: int
    name: str
    emoji: str
    current_streak: int
    created_at: date

    class Config:
        from_attributes = True


class CompletionCreate(BaseModel):
    habit_id: int
    completed_date: date


class CompletionResponse(BaseModel):
    id: int
    habit_id: int
    completed_date: date

    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def calculate_streak(habit_id: int, db: Session) -> int:
    completions = db.query(Completion).filter(
        Completion.habit_id == habit_id
    ).order_by(Completion.completed_date.desc()).all()

    if not completions:
        return 0

    streak = 0
    current_date = date.today()

    for completion in completions:
        if completion.completed_date == current_date:
            streak += 1
            current_date -= timedelta(days=1)
        elif completion.completed_date == current_date:
            continue
        else:
            break

    return streak


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/habits", response_model=List[HabitResponse])
def get_habits(db: Session = Depends(get_db)):
    habits = db.query(Habit).all()
    result = []
    for habit in habits:
        result.append(HabitResponse(
            id=habit.id,
            name=habit.name,
            emoji=habit.emoji,
            current_streak=calculate_streak(habit.id, db),
            created_at=habit.created_at
        ))
    return result


@app.post("/api/habits", response_model=HabitResponse)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    db_habit = Habit(
        name=habit.name,
        emoji=habit.emoji,
        created_at=date.today()
    )
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return HabitResponse(
        id=db_habit.id,
        name=db_habit.name,
        emoji=db_habit.emoji,
        current_streak=0,
        created_at=db_habit.created_at
    )


@app.put("/api/habits/{habit_id}", response_model=HabitResponse)
def update_habit(habit_id: int, habit: HabitUpdate, db: Session = Depends(get_db)):
    db_habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    db_habit.name = habit.name
    db_habit.emoji = habit.emoji
    db.commit()
    db.refresh(db_habit)

    return HabitResponse(
        id=db_habit.id,
        name=db_habit.name,
        emoji=db_habit.emoji,
        current_streak=calculate_streak(db_habit.id, db),
        created_at=db_habit.created_at
    )


@app.delete("/api/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    db_habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not db_habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.delete(db_habit)
    db.commit()
    return {"message": "Habit deleted successfully"}


@app.get("/api/completions", response_model=List[CompletionResponse])
def get_completions(db: Session = Depends(get_db)):
    completions = db.query(Completion).all()
    return completions


@app.post("/api/completions", response_model=CompletionResponse)
def create_completion(completion: CompletionCreate, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == completion.habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    existing = db.query(Completion).filter(
        Completion.habit_id == completion.habit_id,
        Completion.completed_date == completion.completed_date
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Completion already exists")

    db_completion = Completion(
        habit_id=completion.habit_id,
        completed_date=completion.completed_date
    )
    db.add(db_completion)
    db.commit()
    db.refresh(db_completion)
    return db_completion


@app.delete("/api/completions/{completion_id}")
def delete_completion(completion_id: int, db: Session = Depends(get_db)):
    db_completion = db.query(Completion).filter(Completion.id == completion_id).first()
    if not db_completion:
        raise HTTPException(status_code=404, detail="Completion not found")

    db.delete(db_completion)
    db.commit()
    return {"message": "Completion deleted successfully"}