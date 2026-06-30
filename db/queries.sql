-- =====================================================
-- Sohail Training Platform v2 - Week 2
-- Data Layer: Real User JOIN Queries
-- Author: Mudassir Shahab
-- =====================================================

-- =========================
-- 1. Show all trainees
-- Used by admin dashboard Manage Trainees UI
-- =========================
SELECT
    id AS trainee_id,
    name AS trainee_name,
    email,
    role,
    created_at
FROM users
WHERE role = 'trainee'
ORDER BY created_at DESC;

-- =========================
-- 2. Show each trainee with their assigned tasks
-- Proves tasks are linked to real user accounts
-- =========================
SELECT
    trainee.id AS trainee_id,
    trainee.name AS trainee_name,
    trainee.email AS trainee_email,
    tasks.id AS task_id,
    tasks.title AS task_title,
    tasks.description,
    tasks.deadline,
    tasks.status,
    admin_user.name AS created_by_admin,
    tasks.created_at
FROM users AS trainee
JOIN tasks
    ON trainee.id = tasks.assigned_to
JOIN users AS admin_user
    ON tasks.created_by = admin_user.id
WHERE trainee.role = 'trainee'
ORDER BY trainee.name, tasks.deadline;

-- =========================
-- 3. Full trainee lifecycle query
-- Shows trainee, task, submission, score, and feedback
-- =========================
SELECT
    trainee.id AS trainee_id,
    trainee.name AS trainee_name,
    trainee.email AS trainee_email,

    tasks.id AS task_id,
    tasks.title AS task_title,
    tasks.description AS task_description,
    tasks.deadline,
    tasks.status AS task_status,

    submissions.id AS submission_id,
    submissions.submission_text,
    submissions.submitted_at,

    scores.score,
    scores.feedback,
    scores.graded_at,

    admin_user.name AS graded_by_admin
FROM users AS trainee
JOIN tasks
    ON trainee.id = tasks.assigned_to
LEFT JOIN submissions
    ON tasks.id = submissions.task_id
    AND trainee.id = submissions.trainee_id
LEFT JOIN scores
    ON submissions.id = scores.submission_id
LEFT JOIN users AS admin_user
    ON scores.graded_by = admin_user.id
WHERE trainee.role = 'trainee'
ORDER BY trainee.name, tasks.created_at DESC;

-- =========================
-- 4. Trainee dashboard query
-- Replace $1 with the logged-in trainee user id in backend
-- =========================
SELECT
    tasks.id AS task_id,
    tasks.title AS task_title,
    tasks.description,
    tasks.deadline,
    tasks.status,

    submissions.id AS submission_id,
    submissions.submission_text,
    submissions.submitted_at,

    scores.score,
    scores.feedback,
    scores.graded_at
FROM tasks
LEFT JOIN submissions
    ON tasks.id = submissions.task_id
    AND tasks.assigned_to = submissions.trainee_id
LEFT JOIN scores
    ON submissions.id = scores.submission_id
WHERE tasks.assigned_to = $1
ORDER BY tasks.deadline ASC;

-- =========================
-- 5. Admin grading view
-- Shows submitted tasks waiting for grading
-- =========================
SELECT
    submissions.id AS submission_id,
    tasks.id AS task_id,
    tasks.title AS task_title,
    trainee.name AS trainee_name,
    trainee.email AS trainee_email,
    submissions.submission_text,
    submissions.submitted_at,
    tasks.status
FROM submissions
JOIN tasks
    ON submissions.task_id = tasks.id
JOIN users AS trainee
    ON submissions.trainee_id = trainee.id
LEFT JOIN scores
    ON submissions.id = scores.submission_id
WHERE scores.id IS NULL
ORDER BY submissions.submitted_at DESC;

-- =========================
-- 6. Score summary per trainee
-- =========================
SELECT
    trainee.id AS trainee_id,
    trainee.name AS trainee_name,
    trainee.email,
    COUNT(scores.id) AS graded_submissions,
    ROUND(AVG(scores.score), 2) AS average_score
FROM users AS trainee
JOIN submissions
    ON trainee.id = submissions.trainee_id
JOIN scores
    ON submissions.id = scores.submission_id
WHERE trainee.role = 'trainee'
GROUP BY trainee.id, trainee.name, trainee.email
ORDER BY average_score DESC;