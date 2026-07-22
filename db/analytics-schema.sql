-- =====================================================
-- Sohail Platform - Analytics & Reporting Engine
-- Data Layer
-- Author: Mudassir Shahab
-- =====================================================

-- Safe analytics migration.
-- This file does not delete or reset existing project data.
-- It only creates views and indexes used for analytics/reporting.

-- =====================================================
-- Indexes for analytics performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_status
ON tasks (assigned_to, status);

CREATE INDEX IF NOT EXISTS idx_tasks_created_by_created_at
ON tasks (created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_deadline
ON tasks (deadline);

CREATE INDEX IF NOT EXISTS idx_submissions_task_trainee
ON submissions (task_id, trainee_id);

CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at
ON submissions (submitted_at);

CREATE INDEX IF NOT EXISTS idx_scores_submission_score
ON scores (submission_id, score);

CREATE INDEX IF NOT EXISTS idx_team_tasks_created_by_created_at
ON team_tasks (created_by, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_tasks_deadline
ON team_tasks (deadline);

CREATE INDEX IF NOT EXISTS idx_task_members_task_user
ON task_members (task_id, user_id);

CREATE INDEX IF NOT EXISTS idx_task_members_user_score
ON task_members (user_id, score);

CREATE INDEX IF NOT EXISTS idx_task_members_submitted_at
ON task_members (submitted_at);

-- =====================================================
-- View 1: Individual Task Analytics View
-- Combines users, tasks, submissions, and scores
-- =====================================================

CREATE OR REPLACE VIEW vw_individual_task_analytics AS
SELECT
    t.id AS task_id,
    t.title AS task_title,
    t.description AS task_description,
    t.deadline,
    t.status AS task_status,
    t.created_at AS task_created_at,

    trainee.id AS trainee_id,
    trainee.name AS trainee_name,
    trainee.email AS trainee_email,

    admin_user.id AS admin_id,
    admin_user.name AS admin_name,

    s.id AS submission_id,
    s.submission_text,
    s.file_url,
    s.submitted_at,

    sc.id AS score_id,
    sc.score,
    sc.feedback,
    sc.graded_at,

    CASE
        WHEN s.id IS NULL THEN 'not_submitted'
        WHEN s.submitted_at::date <= t.deadline THEN 'on_time'
        ELSE 'late'
    END AS submission_status,

    CASE
        WHEN s.id IS NOT NULL THEN 1
        ELSE 0
    END AS submitted_flag,

    CASE
        WHEN sc.id IS NOT NULL THEN 1
        ELSE 0
    END AS graded_flag
FROM tasks t
JOIN users trainee
    ON t.assigned_to = trainee.id
JOIN users admin_user
    ON t.created_by = admin_user.id
LEFT JOIN submissions s
    ON t.id = s.task_id
    AND trainee.id = s.trainee_id
LEFT JOIN scores sc
    ON s.id = sc.submission_id;

-- =====================================================
-- View 2: Team Task Analytics View
-- Combines team_tasks, task_members, and users
-- =====================================================

CREATE OR REPLACE VIEW vw_team_task_analytics AS
SELECT
    tt.id AS team_task_id,
    tt.title AS team_task_title,
    tt.description AS team_task_description,
    tt.deadline,
    tt.status AS team_task_status,
    tt.created_at AS team_task_created_at,

    admin_user.id AS admin_id,
    admin_user.name AS admin_name,

    tm.id AS task_member_id,
    tm.user_id AS trainee_id,
    trainee.name AS trainee_name,
    trainee.email AS trainee_email,
    tm.part,
    tm.submission_link,
    tm.score,
    tm.feedback,
    tm.submitted_at,
    tm.graded_at,

    CASE
        WHEN tm.submission_link IS NULL THEN 'not_submitted'
        WHEN tm.submitted_at::date <= tt.deadline THEN 'on_time'
        ELSE 'late'
    END AS submission_status,

    CASE
        WHEN tm.submission_link IS NOT NULL THEN 1
        ELSE 0
    END AS submitted_flag,

    CASE
        WHEN tm.score IS NOT NULL THEN 1
        ELSE 0
    END AS graded_flag
FROM team_tasks tt
JOIN users admin_user
    ON tt.created_by = admin_user.id
JOIN task_members tm
    ON tt.id = tm.task_id
JOIN users trainee
    ON tm.user_id = trainee.id;