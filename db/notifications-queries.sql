-- =====================================================
-- Sohail Platform - Notifications & Activity Queries
-- Data Layer
-- Author: Mudassir Shahab
-- =====================================================

-- 1. Fetch unread notification count for one user
-- Replace 6 with the selected user's id
SELECT
    recipient_id,
    COUNT(*) AS unread_count
FROM notifications
WHERE recipient_id = 6
  AND is_read = FALSE
GROUP BY recipient_id;

-- 2. Fetch notification feed for one user
SELECT
    n.id AS notification_id,
    n.recipient_id,
    recipient.name AS recipient_name,
    recipient.email AS recipient_email,

    n.actor_id,
    actor.name AS actor_name,

    n.type,
    n.title,
    n.message,
    n.payload,
    n.related_task_id,
    n.related_team_task_id,
    n.is_read,
    n.created_at,
    n.read_at
FROM notifications n
JOIN users recipient
    ON n.recipient_id = recipient.id
LEFT JOIN users actor
    ON n.actor_id = actor.id
WHERE n.recipient_id = 6
ORDER BY n.created_at DESC
LIMIT 20;

-- 3. Mark one notification as read
-- Replace 1 with the notification id
UPDATE notifications
SET
    is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
WHERE id = 1
RETURNING id, recipient_id, title, is_read, read_at;

-- 4. Mark all notifications as read for one user
-- Replace 6 with the selected user's id
UPDATE notifications
SET
    is_read = TRUE,
    read_at = CURRENT_TIMESTAMP
WHERE recipient_id = 6
  AND is_read = FALSE
RETURNING id, recipient_id, title, is_read, read_at;

-- 5. Insert notification when a task is assigned
-- Example: admin id 1 assigns task id 1 to trainee id 6
INSERT INTO notifications (
    recipient_id,
    actor_id,
    type,
    title,
    message,
    payload,
    related_task_id
)
VALUES (
    6,
    1,
    'task_assigned',
    'New Task Assigned',
    'You have been assigned a new task.',
    '{"source": "task_assignment"}'::jsonb,
    1
)
RETURNING *;

-- 6. Insert notification when a team task is assigned
-- Example: admin id 1 assigns team task id 1 to trainee id 6
INSERT INTO notifications (
    recipient_id,
    actor_id,
    type,
    title,
    message,
    payload,
    related_team_task_id
)
VALUES (
    6,
    1,
    'team_task_assigned',
    'New Team Task Assigned',
    'You have been assigned a part in a team task.',
    '{"part": "Frontend UI"}'::jsonb,
    1
)
RETURNING *;

-- 7. Insert activity log when a team task is assigned
INSERT INTO activity_log (
    actor_id,
    target_user_id,
    event_type,
    entity_type,
    entity_id,
    related_team_task_id,
    description,
    payload
)
VALUES (
    1,
    6,
    'team_task_assigned',
    'team_task',
    1,
    1,
    'Admin assigned a team task part to a trainee.',
    '{"part": "Frontend UI"}'::jsonb
)
RETURNING *;

-- 8. Fetch user activity feed
-- Shows all activity related to one user
-- Replace 6 with the selected user's id
SELECT
    al.id AS activity_id,
    al.event_type,
    al.entity_type,
    al.entity_id,
    al.description,
    al.payload,
    al.created_at,

    actor.id AS actor_id,
    actor.name AS actor_name,
    actor.email AS actor_email,

    target_user.id AS target_user_id,
    target_user.name AS target_user_name,
    target_user.email AS target_user_email
FROM activity_log al
LEFT JOIN users actor
    ON al.actor_id = actor.id
LEFT JOIN users target_user
    ON al.target_user_id = target_user.id
WHERE al.target_user_id = 6
   OR al.actor_id = 6
ORDER BY al.created_at DESC
LIMIT 30;

-- 9. Admin activity feed
-- Shows latest platform-wide activity for admins
SELECT
    al.id AS activity_id,
    al.event_type,
    al.entity_type,
    al.entity_id,
    al.description,
    al.payload,
    al.created_at,

    actor.name AS actor_name,
    target_user.name AS target_user_name
FROM activity_log al
LEFT JOIN users actor
    ON al.actor_id = actor.id
LEFT JOIN users target_user
    ON al.target_user_id = target_user.id
ORDER BY al.created_at DESC
LIMIT 50;

-- 10. Notification summary by user
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(n.id) AS total_notifications,
    COUNT(n.id) FILTER (WHERE n.is_read = FALSE) AS unread_notifications,
    COUNT(n.id) FILTER (WHERE n.is_read = TRUE) AS read_notifications
FROM users u
LEFT JOIN notifications n
    ON u.id = n.recipient_id
GROUP BY u.id, u.name, u.email
ORDER BY unread_notifications DESC, total_notifications DESC;