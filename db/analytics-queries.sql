-- =====================================================
-- Sohail Platform - Analytics & Reporting Queries
-- Data Layer
-- Author: Mudassir Shahab
-- =====================================================

-- =====================================================
-- 1. Overall platform summary
-- Shows total users, tasks, submissions, and grades
-- =====================================================

SELECT
    (SELECT COUNT(*) FROM users WHERE role = 'trainee') AS total_trainees,
    (SELECT COUNT(*) FROM tasks) AS total_individual_tasks,
    (SELECT COUNT(*) FROM team_tasks) AS total_team_tasks,
    (SELECT COUNT(*) FROM submissions) AS total_individual_submissions,
    (SELECT COUNT(*) FROM task_members WHERE submission_link IS NOT NULL) AS total_team_submissions,
    (SELECT COUNT(*) FROM scores) AS total_individual_grades,
    (SELECT COUNT(*) FROM task_members WHERE score IS NOT NULL) AS total_team_grades;

-- =====================================================
-- 2. Average score per trainee
-- Combines individual task scores and team task scores
-- =====================================================

WITH all_scores AS (
    SELECT
        trainee_id,
        trainee_name,
        trainee_email,
        score
    FROM vw_individual_task_analytics
    WHERE score IS NOT NULL

    UNION ALL

    SELECT
        trainee_id,
        trainee_name,
        trainee_email,
        score
    FROM vw_team_task_analytics
    WHERE score IS NOT NULL
)
SELECT
    trainee_id,
    trainee_name,
    trainee_email,
    COUNT(score) AS graded_items,
    ROUND(AVG(score), 2) AS average_score,
    MIN(score) AS lowest_score,
    MAX(score) AS highest_score
FROM all_scores
GROUP BY trainee_id, trainee_name, trainee_email
ORDER BY average_score DESC;

-- =====================================================
-- 3. Individual task submission rate
-- Uses real submitted rows from submissions table
-- =====================================================

SELECT
    COUNT(task_id) AS total_assigned_individual_tasks,
    SUM(submitted_flag) AS submitted_tasks,
    ROUND(
        (SUM(submitted_flag)::numeric / NULLIF(COUNT(task_id), 0)) * 100,
        2
    ) AS submission_rate_percent
FROM vw_individual_task_analytics;

-- =====================================================
-- 4. Team task submission rate
-- Uses task_members because each member submits separately
-- =====================================================

SELECT
    COUNT(task_member_id) AS total_assigned_team_parts,
    SUM(submitted_flag) AS submitted_team_parts,
    ROUND(
        (SUM(submitted_flag)::numeric / NULLIF(COUNT(task_member_id), 0)) * 100,
        2
    ) AS team_submission_rate_percent
FROM vw_team_task_analytics;

-- =====================================================
-- 5. Combined submission rate
-- Combines individual and team submissions
-- =====================================================

WITH combined_assignments AS (
    SELECT submitted_flag
    FROM vw_individual_task_analytics

    UNION ALL

    SELECT submitted_flag
    FROM vw_team_task_analytics
)
SELECT
    COUNT(*) AS total_assigned_items,
    SUM(submitted_flag) AS total_submitted_items,
    ROUND(
        (SUM(submitted_flag)::numeric / NULLIF(COUNT(*), 0)) * 100,
        2
    ) AS combined_submission_rate_percent
FROM combined_assignments;

-- =====================================================
-- 6. On-time vs late submissions
-- Combines individual and team submissions
-- =====================================================

WITH combined_submissions AS (
    SELECT submission_status
    FROM vw_individual_task_analytics
    WHERE submitted_flag = 1

    UNION ALL

    SELECT submission_status
    FROM vw_team_task_analytics
    WHERE submitted_flag = 1
)
SELECT
    submission_status,
    COUNT(*) AS total_count
FROM combined_submissions
GROUP BY submission_status
ORDER BY total_count DESC;

-- =====================================================
-- 7. Team performance by team task
-- Shows each team task's assigned parts, submitted parts, graded parts, and average score
-- =====================================================

SELECT
    team_task_id,
    team_task_title,
    admin_name AS created_by_admin,
    COUNT(task_member_id) AS total_members,
    SUM(submitted_flag) AS submitted_parts,
    SUM(graded_flag) AS graded_parts,
    ROUND(AVG(score), 2) AS average_team_score,
    MIN(score) AS lowest_member_score,
    MAX(score) AS highest_member_score
FROM vw_team_task_analytics
GROUP BY team_task_id, team_task_title, admin_name
ORDER BY team_task_id DESC;

-- =====================================================
-- 8. Per-trainee performance report
-- Shows individual and team work in one trainee report
-- =====================================================

WITH trainee_items AS (
    SELECT
        trainee_id,
        trainee_name,
        trainee_email,
        'individual_task' AS item_type,
        task_title AS item_title,
        submitted_flag,
        graded_flag,
        score,
        submission_status
    FROM vw_individual_task_analytics

    UNION ALL

    SELECT
        trainee_id,
        trainee_name,
        trainee_email,
        'team_task' AS item_type,
        team_task_title AS item_title,
        submitted_flag,
        graded_flag,
        score,
        submission_status
    FROM vw_team_task_analytics
)
SELECT
    trainee_id,
    trainee_name,
    trainee_email,
    COUNT(*) AS total_assigned_items,
    SUM(submitted_flag) AS submitted_items,
    SUM(graded_flag) AS graded_items,
    ROUND(
        (SUM(submitted_flag)::numeric / NULLIF(COUNT(*), 0)) * 100,
        2
    ) AS submission_rate_percent,
    ROUND(AVG(score), 2) AS average_score,
    COUNT(*) FILTER (WHERE submission_status = 'on_time') AS on_time_submissions,
    COUNT(*) FILTER (WHERE submission_status = 'late') AS late_submissions,
    COUNT(*) FILTER (WHERE submission_status = 'not_submitted') AS not_submitted_items
FROM trainee_items
GROUP BY trainee_id, trainee_name, trainee_email
ORDER BY average_score DESC NULLS LAST, submission_rate_percent DESC;

-- =====================================================
-- 9. Admin workload report
-- Shows tasks created and grading completed by each admin
-- =====================================================

WITH admin_created_items AS (
    SELECT
        admin_id,
        admin_name,
        COUNT(task_id) AS individual_tasks_created,
        0 AS team_tasks_created
    FROM vw_individual_task_analytics
    GROUP BY admin_id, admin_name

    UNION ALL

    SELECT
        admin_id,
        admin_name,
        0 AS individual_tasks_created,
        COUNT(DISTINCT team_task_id) AS team_tasks_created
    FROM vw_team_task_analytics
    GROUP BY admin_id, admin_name
)
SELECT
    admin_id,
    admin_name,
    SUM(individual_tasks_created) AS individual_tasks_created,
    SUM(team_tasks_created) AS team_tasks_created,
    SUM(individual_tasks_created + team_tasks_created) AS total_created_items
FROM admin_created_items
GROUP BY admin_id, admin_name
ORDER BY total_created_items DESC;

-- =====================================================
-- 10. Export-ready full analytics report
-- This can power CSV/PDF report export
-- =====================================================

WITH report_rows AS (
    SELECT
        trainee_name,
        trainee_email,
        'Individual Task' AS work_type,
        task_title AS title,
        NULL AS assigned_part,
        submission_status,
        score,
        feedback,
        submitted_at,
        graded_at
    FROM vw_individual_task_analytics

    UNION ALL

    SELECT
        trainee_name,
        trainee_email,
        'Team Task' AS work_type,
        team_task_title AS title,
        part AS assigned_part,
        submission_status,
        score,
        feedback,
        submitted_at,
        graded_at
    FROM vw_team_task_analytics
)
SELECT *
FROM report_rows
ORDER BY trainee_name, work_type, title;