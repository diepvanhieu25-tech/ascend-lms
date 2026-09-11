from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.concept import Concept
    from app.models.diagnostic import DiagnosticAssessment
    from app.models.exercise import Submission
    from app.models.telemetry import TelemetryLog


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        nullable=True,
        index=True,
    )
    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Learner",
    )
    is_guest: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    frustration_index: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    last_active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    cognitive_states: Mapped[list[CognitiveState]] = relationship(
        "CognitiveState",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    submissions: Mapped[list[Submission]] = relationship(
        "Submission",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    telemetry_logs: Mapped[list[TelemetryLog]] = relationship(
        "TelemetryLog",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    diagnostic_assessment: Mapped[DiagnosticAssessment | None] = relationship(
        "DiagnosticAssessment",
        back_populates="student",
        uselist=False,
        cascade="all, delete-orphan",
    )


class CognitiveState(Base):
    __tablename__ = "cognitive_states"

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
    concept_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("concepts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    mastery_prob: Mapped[float] = mapped_column(
        Float,
        default=0.1,
        nullable=False,
        comment="P(L_t) probability of mastery from BKT",
    )
    memory_strength: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
        comment="S_i memory stability from Ebbinghaus curve",
    )
    retention_score: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
        comment="M_i(t) retention probability from Ebbinghaus",
    )
    last_interacted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    total_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    successful_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    __table_args__ = (UniqueConstraint("student_id", "concept_id", name="uq_student_concept"),)

    # Relationships
    student: Mapped[Student] = relationship(
        "Student",
        back_populates="cognitive_states",
    )
    concept: Mapped[Concept] = relationship(
        "Concept",
        back_populates="cognitive_states",
    )
