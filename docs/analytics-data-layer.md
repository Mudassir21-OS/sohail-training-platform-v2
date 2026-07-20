# Analytics & Reporting Engine - Data Layer

## Assigned Part

My assigned part was the Data Layer for the Analytics & Reporting Engine. The goal was to design supporting database views and indexes, and to write multi-table JOIN and aggregation queries that calculate real metrics from live PostgreSQL data.

## Views Added

### vw_individual_task_analytics

This view combines:

- users
- tasks
- submissions
- scores

It provides a clean analytics-ready view for individual tasks. It includes trainee details, task details, submission details, score details, and calculated flags such as submitted_flag, graded_flag, and submission_status.

### vw_team_task_analytics

This view combines:

- users
- team_tasks
- task_members

It provides a clean analytics-ready view for team tasks. It includes team task details, trainee details, assigned part, submission link, score, feedback, submitted_at, graded_at, submitted_flag, graded_flag, and submission_status.

## Indexes Added

Indexes were added to improve performance as data grows.

Important indexes include:

- tasks(assigned_to, status)
- tasks(created_by, created_at DESC)
- tasks(deadline)
- submissions(task_id, trainee_id)
- submissions(submitted_at)
- scores(submission_id, score)
- team_tasks(created_by, created_at DESC)
- team_tasks(deadline)
- task_members(task_id, user_id)
- task_members(user_id, score)
- task_members(submitted_at)

## Metrics Supported

The analytics queries support:

- overall platform summary
- average score per trainee
- individual task submission rate
- team task submission rate
- combined submission rate
- on-time vs late submissions
- team performance by team task
- per-trainee performance report
- admin workload report
- export-ready report data

## Why the Query Logic Is Correct

The metrics are computed in PostgreSQL using real aggregation logic such as COUNT, AVG, SUM, GROUP BY, UNION ALL, and JOINs.

The frontend should not calculate these metrics manually in JavaScript. Instead, the backend should expose these SQL results through analytics API endpoints, and the frontend dashboard should display the returned values.

This approach is correct because it keeps the calculations consistent, database-driven, and scalable as more tasks, submissions, team tasks, and grades are added.

## API Contract Suggestion

### Get analytics summary

GET /api/analytics/summary

### Get average score per trainee

GET /api/analytics/average-score-per-trainee

### Get submission rate

GET /api/analytics/submission-rate

### Get on-time vs late submissions

GET /api/analytics/on-time-vs-late

### Get team performance

GET /api/analytics/team-performance

### Get per-trainee performance report

GET /api/analytics/trainee-performance

### Export analytics report

GET /api/analytics/export.csv

The export endpoint should use the export-ready full analytics report query.