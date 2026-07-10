# Week 3 Data Layer - Team Tasks and Submission Depth

## Assigned Part

My assigned part for Week 3 was the Data Layer. The goal was to design database support for team tasks, where one shared team task can be assigned to multiple trainees. Each trainee has their own assigned part, submission link, score, and feedback.

## New Tables Added

### team_tasks

The `team_tasks` table stores one shared team task created by an admin.

Fields:

- id
- title
- description
- created_by
- deadline
- status
- created_at

### task_members

The `task_members` table connects each team task to multiple users.

Fields:

- id
- task_id
- user_id
- part
- submission_link
- score
- feedback
- submitted_at
- graded_at

## Relationships

- team_tasks.created_by references users.id
- task_members.task_id references team_tasks.id
- task_members.user_id references users.id

These relationships support the one-task-to-many-members model. One team task can have multiple assigned trainees, and each trainee can have a different part, submission link, score, and feedback.

## Main JOIN Query Purpose

The main JOIN query combines:

- team task details
- admin who created the task
- assigned members
- each member's part
- submission link
- score
- feedback
- submitted_at
- graded_at

This proves that the team task data is stored relationally and can be viewed in one complete result.

## Suggested API Contract

### Create Team Task

POST /api/team-tasks

Request:

```json
{
  "title": "Week 3 Team Task",
  "description": "Build the team task workflow.",
  "deadline": "2026-07-10",
  "members": [
    {
      "user_id": 2,
      "part": "Frontend UI"
    },
    {
      "user_id": 3,
      "part": "Backend API"
    },
    {
      "user_id": 4,
      "part": "Auth and Roles"
    },
    {
      "user_id": 5,
      "part": "Data Layer"
    }
  ]
}
```

### List Team Tasks

GET /api/team-tasks

### Get Full Team Task View

GET /api/team-tasks/:id

### Submit Member Part

PUT /api/team-tasks/:taskId/members/:userId/submit

Request:

```json
{
  "submission_link": "https://github.com/example/submission"
}
```

### Grade Member Part

PUT /api/team-tasks/:taskId/members/:userId/grade

Request:

```json
{
  "score": 90,
  "feedback": "Good work."
}
```

## Integration Notes

The backend should create one row in `team_tasks` for the shared team task. Then it should create one row per assigned member in `task_members`.

The frontend should display each team task with all assigned members, their parts, submission links, scores, and feedback.

The authentication layer should ensure that only admins can create team tasks and grade member parts. Trainees should only see and submit their own assigned part.