# Notifications & Activity System - Data Layer

## Assigned Part

My assigned part was the Data Layer for the Notifications & Activity System. The goal was to design database tables that persist notifications and activity events, so users can receive real notifications and view an activity feed.

## Tables Added

### notifications

The `notifications` table stores per-user notifications.

Main fields:

- id
- recipient_id
- actor_id
- type
- title
- message
- payload
- related_task_id
- related_team_task_id
- is_read
- created_at
- read_at

### activity_log

The `activity_log` table stores system events such as task assignment, submission, grading, and notification read events.

Main fields:

- id
- actor_id
- target_user_id
- event_type
- entity_type
- entity_id
- related_task_id
- related_team_task_id
- description
- payload
- created_at

## Foreign Keys

- notifications.recipient_id references users.id
- notifications.actor_id references users.id
- notifications.related_task_id references tasks.id
- notifications.related_team_task_id references team_tasks.id
- activity_log.actor_id references users.id
- activity_log.target_user_id references users.id
- activity_log.related_task_id references tasks.id
- activity_log.related_team_task_id references team_tasks.id

## Indexes

Indexes were added to keep notification and activity feed queries fast as data grows.

Important indexes:

- notifications(recipient_id, created_at DESC)
- notifications(recipient_id, is_read) where is_read = false
- activity_log(target_user_id, created_at DESC)
- activity_log(actor_id, created_at DESC)
- activity_log(event_type)
- activity_log(entity_type, entity_id)

## Main Queries

The main queries support:

- unread notification count per user
- notification feed per user
- mark one notification as read
- mark all notifications as read
- insert notification when a task is assigned
- insert notification when a team task is assigned
- insert activity log events
- fetch a user's activity feed
- fetch admin-wide activity feed

## Why This Design Is Correct

Notifications are stored separately from activity logs because they serve different purposes.

Notifications are user-facing alerts. They belong to a recipient and have a read/unread state.

Activity logs are historical records of actions in the system. They record who performed an action, who was affected, what type of event happened, and when it happened.

This design allows the platform to show a notification bell, unread counts, and a live activity feed without hardcoding any events.