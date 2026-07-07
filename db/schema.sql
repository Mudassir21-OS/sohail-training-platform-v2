-- =====================================================
-- Sohail Training Platform v2 - Week 3
-- Data Layer: Team Tasks and Submission Depth
-- Author: Mudassir Shahab
-- =====================================================

DROP TABLE IF EXISTS task_members;
DROP TABLE IF EXISTS team_tasks;
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
-- Individual Tasks Table
-- Week 2 individual task support
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
-- Individual Submissions Table
-- Week 2 individual submission support
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
-- Individual Scores Table
-- Week 2 individual grading support
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

-- =====================================================
-- Week 3 Team Task Tables
-- =====================================================

-- =========================
-- Team Tasks Table
-- Stores one shared team task created by an admin
-- =========================
CREATE TABLE team_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned', 'in_progress', 'submitted', 'graded')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_team_tasks_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================
-- Task Members Table
-- Connects one team task to multiple trainees
-- Each trainee has their own part, submission link, score, and feedback
-- =========================
CREATE TABLE task_members (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    part VARCHAR(150) NOT NULL,
    submission_link TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    feedback TEXT,
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,

    CONSTRAINT fk_task_members_task
        FOREIGN KEY (task_id)
        REFERENCES team_tasks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_task_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_team_task_member
        UNIQUE (task_id, user_id)
);