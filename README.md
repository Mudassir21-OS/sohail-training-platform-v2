# sohail-training-platform-v2
Integrated full-stack training management platform with React, Node/Express, PostgreSQL, JWT authentication, and dashboard views.

## Week 2 API Contract - Real User System

### Data Layer Update

For Week 2, the Sohail Training Platform v2 was updated from a demo-based system to a real-user system. The database now supports admins and trainees as real users with login credentials and roles.

### Main Tables

- users
- tasks
- submissions
- scores

### Database Relationships

- tasks.created_by references users.id
- tasks.assigned_to references users.id
- submissions.task_id references tasks.id
- submissions.trainee_id references users.id
- scores.submission_id references submissions.id
- scores.graded_by references users.id

### Users

#### Create trainee

POST /api/users/trainees

Request body:

```json
{
  "name": "Test Trainee",
  "email": "testtrainee@sohail.com",
  "password": "trainee123"
}
```

Expected response:

```json
{
  "id": 2,
  "name": "Test Trainee",
  "email": "testtrainee@sohail.com",
  "role": "trainee"
}
```

#### List trainees

GET /api/users?role=trainee

Expected response:

```json
[
  {
    "id": 2,
    "name": "Test Trainee",
    "email": "testtrainee@sohail.com",
    "role": "trainee"
  }
]
```

### Tasks

#### Create task assigned to a real trainee

POST /api/tasks

Request body:

```json
{
  "title": "Week 2 Task",
  "description": "Submit this task for grading.",
  "assigned_to": 2,
  "deadline": "2026-07-03"
}
```

### Submissions

#### Submit task

POST /api/submissions

Request body:

```json
{
  "task_id": 1,
  "submission_text": "This is my submission."
}
```

### Scores

#### Grade submission

PUT /api/submissions/:id/grade

Request body:

```json
{
  "score": 90,
  "feedback": "Good work."
}
```

### Test Admin Account

Admin login:

```text
admin@sohail.com
admin123
```

New trainee accounts should be created through the dashboard/API instead of being hardcoded in seed data.