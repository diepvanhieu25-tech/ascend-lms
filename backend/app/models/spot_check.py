from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise import Exercise, Submission


class SpotCheck(Base):
    __tablename__ = "spot_checks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    exercise_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("exercises.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Conceptual 30s verification question (e.g. 'Why use LEFT JOIN instead of INNER JOIN here?')",
    )
    options: Mapped[list[Any]] = mapped_column(
        JSONB,
        nullable=False,
        comment="Array of 3-4 multiple-choice options",
    )
    correct_option_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="0-indexed position of correct answer",
    )
    explanation: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        comment="Socratic explanation shown after attempt",
    )

    # Relationships
    exercise: Mapped[Exercise] = relationship(
        "Exercise",
        back_populates="spot_checks",
    )
    attempts: Mapped[list[SpotCheckAttempt]] = relationship(
        "SpotCheckAttempt",
        back_populates="spot_check",
        cascade="all, delete-orphan",
    )


class SpotCheckAttempt(Base):
    __tablename__ = "spot_check_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    submission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("submissions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    spot_check_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("spot_checks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    selected_option_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    response_time_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Time elapsed from modal popup to answer (< 30s expected)",
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    submission: Mapped[Submission] = relationship(
        "Submission",
        back_populates="spot_check_attempt",
    )
    spot_check: Mapped[SpotCheck] = relationship(
        "SpotCheck",
        back_populates="attempts",
    )
