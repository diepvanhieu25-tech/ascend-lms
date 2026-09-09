from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.exercise import Exercise
    from app.models.student import CognitiveState


class Concept(Base):
    __tablename__ = "concepts"

    id: Mapped[str] = mapped_column(
        String(100),
        primary_key=True,
        comment="Unique concept identifier, e.g. sql_inner_join",
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    bloom_level: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
        comment="Bloom taxonomy cognitive depth level (1-6)",
    )
    default_prior_l0: Mapped[float] = mapped_column(
        Float,
        default=0.1,
        nullable=False,
        comment="Initial mastery prior L_0 for beginner",
    )
    ebbinghaus_strength_base: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
        comment="Base memory half-life / stability S_0",
    )

    # Relationships
    exercises: Mapped[list[Exercise]] = relationship(
        "Exercise",
        back_populates="concept",
        cascade="all, delete-orphan",
    )
    cognitive_states: Mapped[list[CognitiveState]] = relationship(
        "CognitiveState",
        back_populates="concept",
        cascade="all, delete-orphan",
    )
    prerequisites: Mapped[list[Prerequisite]] = relationship(
        "Prerequisite",
        foreign_keys="[Prerequisite.concept_id]",
        back_populates="concept",
        cascade="all, delete-orphan",
    )
    dependent_concepts: Mapped[list[Prerequisite]] = relationship(
        "Prerequisite",
        foreign_keys="[Prerequisite.prerequisite_id]",
        back_populates="prerequisite",
        cascade="all, delete-orphan",
    )


class Prerequisite(Base):
    __tablename__ = "prerequisites"

    concept_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("concepts.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Target concept requiring a prior concept",
    )
    prerequisite_id: Mapped[str] = mapped_column(
        String(100),
        ForeignKey("concepts.id", ondelete="CASCADE"),
        primary_key=True,
        comment="Pre-requisite concept that must be mastered first",
    )

    # Relationships
    concept: Mapped[Concept] = relationship(
        "Concept",
        foreign_keys=[concept_id],
        back_populates="prerequisites",
    )
    prerequisite: Mapped[Concept] = relationship(
        "Concept",
        foreign_keys=[prerequisite_id],
        back_populates="dependent_concepts",
    )
