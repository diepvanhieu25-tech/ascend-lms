import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.models.concept import Concept, Prerequisite
from app.models.diagnostic import DiagnosticAssessment
from app.models.exercise import Exercise, Submission
from app.models.spot_check import SpotCheck, SpotCheckAttempt
from app.models.student import CognitiveState, Student
from app.models.telemetry import TelemetryLog


@pytest_asyncio.fixture
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest.mark.asyncio
async def test_db_connection(db_session: AsyncSession) -> None:
    result = await db_session.execute(text("SELECT 1"))
    assert result.scalar() == 1


@pytest.mark.asyncio
async def test_student_and_cognitive_state_lifecycle(db_session: AsyncSession) -> None:
    # 1. Create a guest student
    guest = Student(
        display_name="Guest Learner",
        is_guest=True,
        frustration_index=0.15,
    )
    db_session.add(guest)
    await db_session.flush()

    assert guest.id is not None
    assert guest.is_guest is True
    assert guest.created_at is not None

    # 2. Create concept
    concept = Concept(
        id=f"test_concept_{uuid.uuid4().hex[:6]}",
        name="Test SQL Concept",
        bloom_level=2,
        default_prior_l0=0.1,
        ebbinghaus_strength_base=1.0,
    )
    db_session.add(concept)
    await db_session.flush()

    # 3. Create cognitive state for student on concept
    cog_state = CognitiveState(
        student_id=guest.id,
        concept_id=concept.id,
        mastery_prob=0.65,
        memory_strength=2.5,
        retention_score=0.88,
        total_attempts=3,
        successful_attempts=2,
    )
    db_session.add(cog_state)
    await db_session.flush()

    # Verify query
    stmt = select(CognitiveState).where(
        CognitiveState.student_id == guest.id,
        CognitiveState.concept_id == concept.id,
    )
    res = (await db_session.execute(stmt)).scalar_one()
    assert res.mastery_prob == 0.65
    assert res.successful_attempts == 2

    # Verify unique constraint on (student_id, concept_id)
    duplicate_state = CognitiveState(
        student_id=guest.id,
        concept_id=concept.id,
        mastery_prob=0.9,
    )
    db_session.add(duplicate_state)
    with pytest.raises(IntegrityError):
        await db_session.flush()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_concept_prerequisites_graph(db_session: AsyncSession) -> None:
    c1 = Concept(id=f"sql_base_{uuid.uuid4().hex[:6]}", name="Base", bloom_level=1)
    c2 = Concept(id=f"sql_adv_{uuid.uuid4().hex[:6]}", name="Advanced", bloom_level=3)
    db_session.add_all([c1, c2])
    await db_session.flush()

    prereq = Prerequisite(concept_id=c2.id, prerequisite_id=c1.id)
    db_session.add(prereq)
    await db_session.flush()

    stmt = select(Prerequisite).where(Prerequisite.concept_id == c2.id)
    saved_prereq = (await db_session.execute(stmt)).scalar_one()
    assert saved_prereq.prerequisite_id == c1.id


@pytest.mark.asyncio
async def test_exercise_submission_telemetry_flow(db_session: AsyncSession) -> None:
    student = Student(display_name="Submitting Student", is_guest=True)
    concept = Concept(id=f"c_sub_{uuid.uuid4().hex[:6]}", name="Concept Sub", bloom_level=2)
    db_session.add_all([student, concept])
    await db_session.flush()

    exercise = Exercise(
        id=f"ex_{uuid.uuid4().hex[:8]}",
        concept_id=concept.id,
        difficulty="BEGINNER",
        mode="LEARN_NEW",
        title="Select all customers",
        description="Write a query to retrieve all customers.",
        schema_ddl="CREATE TABLE customers (id INT, name TEXT);",
        seed_data_sql="INSERT INTO customers VALUES (1, 'Alice');",
        solution_sql="SELECT * FROM customers;",
        ast_constraints={"required_clauses": ["SELECT", "FROM"]},
        progressive_hints=[
            {"level": 1, "hint": "Use SELECT keyword"},
            {"level": 2, "hint": "Target the customers table"},
        ],
    )
    db_session.add(exercise)
    await db_session.flush()

    # Submission
    submission = Submission(
        student_id=student.id,
        exercise_id=exercise.id,
        submitted_sql="SELECT * FROM customers;",
        is_correct=True,
        ast_passed=True,
        execution_time_ms=2.4,
        ast_violations=[],
    )
    db_session.add(submission)
    await db_session.flush()

    # Telemetry Log
    telemetry = TelemetryLog(
        student_id=student.id,
        exercise_id=exercise.id,
        time_spent_seconds=42,
        keystroke_count=28,
        paste_events_count=0,
        min_paste_duration_ms=0,
        tab_switches=0,
        flagged_suspicious=False,
    )
    db_session.add(telemetry)
    await db_session.flush()

    assert submission.id is not None
    assert telemetry.id is not None
    assert telemetry.time_spent_seconds == 42


@pytest.mark.asyncio
async def test_spot_check_and_diagnostic(db_session: AsyncSession) -> None:
    student = Student(display_name="Spot Check Student", is_guest=True)
    concept = Concept(id=f"c_spot_{uuid.uuid4().hex[:6]}", name="Concept Spot", bloom_level=2)
    db_session.add_all([student, concept])
    await db_session.flush()

    exercise = Exercise(
        id=f"ex_spot_{uuid.uuid4().hex[:8]}",
        concept_id=concept.id,
        difficulty="INTERMEDIATE",
        mode="PRACTICE_REVIEW",
        title="Spot Check Ex",
        description="Desc",
        schema_ddl="CREATE TABLE t (id INT);",
        seed_data_sql="INSERT INTO t VALUES (1);",
        solution_sql="SELECT 1;",
    )
    db_session.add(exercise)
    await db_session.flush()

    submission = Submission(
        student_id=student.id,
        exercise_id=exercise.id,
        submitted_sql="SELECT 1;",
        is_correct=True,
        ast_passed=True,
    )
    db_session.add(submission)
    await db_session.flush()

    # Spot Check
    spot_check = SpotCheck(
        exercise_id=exercise.id,
        question="Why did you select 1?",
        options=["Because it is constant", "Random choice", "Syntax requirement"],
        correct_option_index=0,
        explanation="1 is a constant literal.",
    )
    db_session.add(spot_check)
    await db_session.flush()

    # Spot Check Attempt
    attempt = SpotCheckAttempt(
        submission_id=submission.id,
        spot_check_id=spot_check.id,
        selected_option_index=0,
        is_correct=True,
        response_time_seconds=8,
    )
    db_session.add(attempt)
    await db_session.flush()

    # Diagnostic Assessment
    diagnostic = DiagnosticAssessment(
        student_id=student.id,
        responses={"q1": "A", "q2": "B"},
        inferred_k0=[0.5] * 18,
        declared_profile="BEGINNER",
        pre_test_score=80.0,
    )
    db_session.add(diagnostic)
    await db_session.flush()

    assert attempt.is_correct is True
    assert diagnostic.declared_profile == "BEGINNER"


@pytest.mark.asyncio
async def test_cascade_deletion(db_session: AsyncSession) -> None:
    student = Student(display_name="Cascade Student", is_guest=True)
    concept = Concept(id=f"c_casc_{uuid.uuid4().hex[:6]}", name="Concept Cascade", bloom_level=1)
    db_session.add_all([student, concept])
    await db_session.flush()

    cog_state = CognitiveState(student_id=student.id, concept_id=concept.id)
    diagnostic = DiagnosticAssessment(
        student_id=student.id,
        responses={},
        inferred_k0=[],
        declared_profile="TESTED",
    )
    db_session.add_all([cog_state, diagnostic])
    await db_session.flush()

    # Delete student
    await db_session.delete(student)
    await db_session.flush()

    # Verify cognitive state and diagnostic assessment were cascaded
    res_state = (
        await db_session.execute(
            select(CognitiveState).where(CognitiveState.student_id == student.id)
        )
    ).first()
    assert res_state is None

    res_diag = (
        await db_session.execute(
            select(DiagnosticAssessment).where(DiagnosticAssessment.student_id == student.id)
        )
    ).first()
    assert res_diag is None
