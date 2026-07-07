-- =====================================================
-- Sohail Training Platform v2 - Week 3
-- Data Layer: Team Task JOIN Queries
-- Author: Mudassir Shahab
-- =====================================================

-- =========================
-- 1. Show all team tasks
-- =========================
SELECT
    tt.id AS team_task_id,
    tt.title,
    tt.description,
    admin_user.name AS created_by_admin,
    tt.deadline,
    tt.status,
    tt.created_at
FROM team_tasks AS tt
JOIN users AS admin_user
    ON tt.created_by = admin_user.id
ORDER BY tt.created_at DESC;

-- =========================
-- 2. Show all members assigned to team tasks
-- =========================
SELECT
    tt.id AS team_task_id,
    tt.title AS team_task_title,
    u.id AS member_id,
    u.name AS member_name,
    u.email AS member_email,
    tm.part,
    tm.submission_link,
    tm.score,
    tm.feedback
FROM team_tasks AS tt
JOIN task_members AS tm
    ON tt.id = tm.task_id
JOIN users AS u
    ON tm.user_id = u.id
ORDER BY tt.id, u.name;

-- =========================
-- 3. Full team task view
-- Shows one team task with all members, parts, submissions, scores, and feedback
-- =========================
SELECT
    tt.id AS team_task_id,
    tt.title AS team_task_title,
    tt.description AS team_task_description,
    tt.deadline,
    tt.status AS team_task_status,

    admin_user.name AS created_by_admin,

    u.id AS member_id,
    u.name AS member_name,
    u.email AS member_email,

    tm.part AS assigned_part,
    tm.submission_link,
    tm.score,
    tm.feedback,
    tm.submitted_at,
    tm.graded_at
FROM team_tasks AS tt
JOIN users AS admin_user
    ON tt.created_by = admin_user.id
JOIN task_members AS tm
    ON tt.id = tm.task_id
JOIN users AS u
    ON tm.user_id = u.id
ORDER BY tt.created_at DESC, u.name;

-- =========================
-- 4. Full view for one specific team task
-- Replace 1 with the selected team task id
-- =========================
SELECT
    tt.id AS team_task_id,
    tt.title AS team_task_title,
    tt.description AS team_task_description,
    tt.deadline,
    tt.status AS team_task_status,

    admin_user.name AS created_by_admin,

    u.name AS member_name,
    u.email AS member_email,
    tm.part AS assigned_part,
    tm.submission_link,
    tm.score,
    tm.feedback,
    tm.submitted_at,
    tm.graded_at
FROM team_tasks AS tt
JOIN users AS admin_user
    ON tt.created_by = admin_user.id
JOIN task_members AS tm
    ON tt.id = tm.task_id
JOIN users AS u
    ON tm.user_id = u.id
WHERE tt.id = 1
ORDER BY u.name;

-- =========================
-- 5. Average team task score
-- Shows average score for each team task
-- =========================
SELECT
    tt.id AS team_task_id,
    tt.title AS team_task_title,
    COUNT(tm.id) AS total_members,
    COUNT(tm.score) AS graded_members,
    ROUND(AVG(tm.score), 2) AS average_team_score
FROM team_tasks AS tt
JOIN task_members AS tm
    ON tt.id = tm.task_id
GROUP BY tt.id, tt.title
ORDER BY average_team_score DESC;

-- =========================
-- 6. Member performance across team tasks
-- Shows each member's assigned parts and scores
-- =========================
SELECT
    u.id AS member_id,
    u.name AS member_name,
    u.email AS member_email,
    tt.title AS team_task_title,
    tm.part,
    tm.submission_link,
    tm.score,
    tm.feedback
FROM users AS u
JOIN task_members AS tm
    ON u.id = tm.user_id
JOIN team_tasks AS tt
    ON tm.task_id = tt.id
WHERE u.role = 'trainee'
ORDER BY u.name, tt.created_at DESC;