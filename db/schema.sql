-- =====================================================
-- Sohail Training Platform v2 - Week 2
-- Data Layer: Real User System Schema
-- Author: Mudassir Shahab
-- =====================================================

DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- =========================
-- Users Table
-- Stores admins and trainees with login credentials and roles
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'trainee')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Tasks Table
-- Each task is created by an admin and assigned to one real trainee user
-- =========================
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    assigned_to INTEGER NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned', 'submitted', 'graded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tasks_assigned_to
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- Submissions Table
-- Each submission belongs to a task and a real trainee user
-- =========================
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    trainee_id INTEGER NOT NULL,
    submission_text TEXT NOT NULL,
    file_url TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_submissions_task
        FOREIGN KEY (task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_submissions_trainee
        FOREIGN KEY (trainee_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_task_submission
        UNIQUE (task_id, trainee_id)
);

-- =========================
-- Scores Table
-- Each score belongs to one submission and is graded by an admin
-- =========================
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER UNIQUE NOT NULL,
    graded_by INTEGER NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    graded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_scores_submission
        FOREIGN KEY (submission_id)
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_scores_graded_by
        FOREIGN KEY (graded_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);