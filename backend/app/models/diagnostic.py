from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.student import Student


class DiagnosticAssessment(Base):
    __tablename__ = "diagnostic_assessments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    responses: Mapped[dict[str, Any] | list[Any]] = mapped_column(
        JSONB,
        nullable=False,
        comment="Recorded responses to 5-7 adaptive placement questions",
    )
    inferred_k0: Mapped[dict[str, Any] | list[Any]] = mapped_column(
        JSONB,
        nullable=False,
        comment="Inferred mastery vector K_0 after DAG prerequisite propagation",
    )
    declared_profile: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="BEGINNER, INTERMEDIATE, ADVANCED, or TESTED",
    )
    pre_test_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    student: Mapped[Student] = relationship(
        "Student",
        back_populates="diagnostic_assessment",
    )
