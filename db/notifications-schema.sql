-- =====================================================
-- Sohail Platform - Notifications & Activity System
-- Data Layer
-- Author: Mudassir Shahab
-- =====================================================

-- Safe migration: does not delete existing users/tasks/submissions/scores.

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,

    recipient_id INTEGER NOT NULL,
    actor_id INTEGER,

    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'task_assigned',
            'team_task_assigned',
            'submission_received',
            'grade_posted',
            'system_message'
        )
    ),

    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,

    related_task_id INTEGER,
    related_team_task_id INTEGER,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,

    CONSTRAINT fk_notifications_recipient
        FOREIGN KEY (recipient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_notifications_task
        FOREIGN KEY (related_task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_notifications_team_task
        FOREIGN KEY (related_team_task_id)
        REFERENCES team_tasks(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,

    actor_id INTEGER,
    target_user_id INTEGER,

    event_type VARCHAR(50) NOT NULL CHECK (
        event_type IN (
            'task_assigned',
            'team_task_assigned',
            'submission_created',
            'team_submission_created',
            'grade_created',
            'notification_read',
            'login',
            'system_event'
        )
    ),

    entity_type VARCHAR(50) NOT NULL CHECK (
        entity_type IN (
            'task',
            'team_task',
            'submission',
            'score',
            'notification',
            'user',
            'system'
        )
    ),

    entity_id INTEGER,
    related_task_id INTEGER,
    related_team_task_id INTEGER,

    description TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_actor
        FOREIGN KEY (actor_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_activity_target_user
        FOREIGN KEY (target_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_task
        FOREIGN KEY (related_task_id)
        REFERENCES tasks(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_activity_team_task
        FOREIGN KEY (related_team_task_id)
        REFERENCES team_tasks(id)
        ON DELETE CASCADE
);

-- =====================================================
-- Indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
ON notifications (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
ON notifications (recipient_id, is_read)
WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_type
ON notifications (type);

CREATE INDEX IF NOT EXISTS idx_activity_target_created
ON activity_log (target_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_actor_created
ON activity_log (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_event_type
ON activity_log (event_type);

CREATE INDEX IF NOT EXISTS idx_activity_entity
ON activity_log (entity_type, entity_id);