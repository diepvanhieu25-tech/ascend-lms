from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.concept import Concept
    from app.models.spot_check import SpotCheck, SpotCheckAttempt
    from app.models.student import Student
    from app.models.telemetry import TelemetryLog


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[str] = mapped_column(
        String(100),
        primary_key=True,
        comment="Unique exercise ID, e.g. ex_join_null_01",
    )
    concept_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("concepts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    difficulty: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="BEGINNER, INTERMEDIATE, ADVANCED",
    )
    mode: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="LEARN_NEW, PRACTICE_REVIEW, DIAGNOSTIC",
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    schema_ddl: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="DDL statements to create SQLite sandbox tables",
    )
    seed_data_sql: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="INSERT statements to seed SQLite sandbox rows (< 100 rows)",
    )
    solution_sql: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Standard reference SQL query for grading",
    )
    ast_constraints: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="sqlglot AST rules: required clauses, forbidden hardcoding",
    )
    progressive_hints: Mapped[list[Any] | None] = mapped_column(
        JSONB,
        nullable=True,
        comment="3 progressive levels of Socratic hints",
    )

    # Relationships
    concept: Mapped[Concept] = relationship(
        "Concept",
        back_populates="exercises",
    )
    submissions: Mapped[list[Submission]] = relationship(
        "Submission",
        back_populates="exercise",
        cascade="all, delete-orphan",
    )
    spot_checks: Mapped[list[SpotCheck]] = relationship(
        "SpotCheck",
        back_populates="exercise",
        cascade="all, delete-orphan",
    )
    telemetry_logs: Mapped[list[TelemetryLog]] = relationship(
        "TelemetryLog",
        back_populates="exercise",
        cascade="all, delete-orphan",
    )


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exercise_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    submitted_sql: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    ast_passed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    execution_time_ms: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    ast_violations: Mapped[list[Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    student: Mapped[Student] = relationship(
        "Student",
        back_populates="submissions",
    )
    exercise: Mapped[Exercise] = relationship(
        "Exercise",
        back_populates="submissions",
    )
    spot_check_attempt: Mapped[SpotCheckAttempt | None] = relationship(
        "SpotCheckAttempt",
        back_populates="submission",
        uselist=False,
        cascade="all, delete-orphan",
    )
