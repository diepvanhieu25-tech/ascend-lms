from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise import Exercise
    from app.models.student import Student


class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

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
    time_spent_seconds: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Total interaction time on exercise workspace",
    )
    keystroke_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Total individual keyboard input events",
    )
    paste_events_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Number of clipboard paste occurrences",
    )
    min_paste_duration_ms: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Smallest duration measured between paste strokes (0ms = instant GenAI)",
    )
    tab_switches: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Blur/focus switches away from Monaco window",
    )
    flagged_suspicious: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Flagged by heuristic: fast paste + tab switch + high length",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    student: Mapped[Student] = relationship(
        "Student",
        back_populates="telemetry_logs",
    )
    exercise: Mapped[Exercise] = relationship(
        "Exercise",
        back_populates="telemetry_logs",
    )
