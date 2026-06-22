-- =====================================================
-- Sohail Training Platform v2
-- Data Layer: Dashboard JOIN Queries
-- Author: Mudassir Shahab
-- =====================================================

-- =========================
-- 1. Admin Dashboard View
-- Shows each task with assigned trainee, submission, score, and feedback
-- =========================
SELECT
    tasks.id AS task_id,
    tasks.title AS task_title,
    tasks.description AS task_description,
    admin_user.name AS created_by_admin,
    trainee_user.name AS assigned_trainee,
    trainee_user.email AS trainee_email,
    tasks.deadline,
    tasks.status AS task_status,
    submissions.submission_text,
    submissions.submitted_at,
    scores.score,
    scores.feedback,
    scores.graded_at
FROM tasks
JOIN users AS admin_user
    ON tasks.created_by = admin_user.id
JOIN users AS trainee_user
    ON tasks.assigned_to = trainee_user.id
LEFT JOIN submissions
    ON tasks.id = submissions.task_id
    AND tasks.assigned_to = submissions.trainee_id
LEFT JOIN scores
    ON submissions.id = scores.submission_id
ORDER BY tasks.created_at DESC;

-- =========================
-- 2. Trainee Dashboard View
-- Shows tasks assigned to one trainee
-- Replace 2 with the logged-in trainee user ID
-- =========================
SELECT
    tasks.id AS task_id,
    tasks.title AS task_title,
    tasks.description,
    tasks.deadline,
    tasks.status,
    submissions.submission_text,
    submissions.submitted_at,
    scores.score,
    scores.feedback
FROM tasks
LEFT JOIN submissions
    ON tasks.id = submissions.task_id
    AND tasks.assigned_to = submissions.trainee_id
LEFT JOIN scores
    ON submissions.id = scores.submission_id
WHERE tasks.assigned_to = 2
ORDER BY tasks.deadline ASC;

-- =========================
-- 3. Grading View
-- Shows submitted tasks waiting for grading
-- =========================
SELECT
    submissions.id AS submission_id,
    tasks.title AS task_title,
    trainee_user.name AS trainee_name,
    trainee_user.email AS trainee_email,
    submissions.submission_text,
    submissions.submitted_at,
    tasks.status
FROM submissions
JOIN tasks
    ON submissions.task_id = tasks.id
JOIN users AS trainee_user
    ON submissions.trainee_id = trainee_user.id
LEFT JOIN scores
    ON submissions.id = scores.submission_id
WHERE scores.id IS NULL
ORDER BY submissions.submitted_at DESC;

-- =========================
-- 4. Score Summary
-- Shows average score per trainee
-- =========================
SELECT
    users.id AS trainee_id,
    users.name AS trainee_name,
    users.email,
    COUNT(scores.id) AS graded_submissions,
    ROUND(AVG(scores.score), 2) AS average_score
FROM users
JOIN submissions
    ON users.id = submissions.trainee_id
JOIN scores
    ON submissions.id = scores.submission_id
WHERE users.role = 'trainee'
GROUP BY users.id, users.name, users.email
ORDER BY average_score DESC;