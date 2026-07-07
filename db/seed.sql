-- =====================================================
-- Sohail Training Platform v2 - Week 3
-- Data Layer: Sample Team Task Seed Data
-- Author: Mudassir Shahab
-- =====================================================

-- Seed users
-- Password hash below is for testing only.
-- In the real app, passwords should be hashed by the backend/auth layer.
INSERT INTO users (name, email, password_hash, role)
VALUES
('Admin User', 'admin@sohail.com', '$2b$10$/Yxwp3IsPnC6vgdMF0kesOazgU4eWAFgomPzevHzpKLdTqnSsc8R.', 'admin'),
('Emna Daly', 'emna@sohail.com', '$2b$10$/Yxwp3IsPnC6vgdMF0kesOazgU4eWAFgomPzevHzpKLdTqnSsc8R.', 'trainee'),
('Abdul Rahim', 'abdul@sohail.com', '$2b$10$/Yxwp3IsPnC6vgdMF0kesOazgU4eWAFgomPzevHzpKLdTqnSsc8R.', 'trainee'),
('Mayaz Bakoura', 'mayaz@sohail.com', '$2b$10$/Yxwp3IsPnC6vgdMF0kesOazgU4eWAFgomPzevHzpKLdTqnSsc8R.', 'trainee'),
('Mudassir Shahab', 'mudassir@sohail.com', '$2b$10$/Yxwp3IsPnC6vgdMF0kesOazgU4eWAFgomPzevHzpKLdTqnSsc8R.', 'trainee');

-- Seed one team task
INSERT INTO team_tasks (title, description, created_by, deadline, status)
VALUES
(
    'Week 3 Team Task - Team Submission Workflow',
    'Build a team-based task workflow where each member has their own assigned part, submission link, and individual grade.',
    1,
    '2026-07-10',
    'submitted'
);

-- Assign members to the team task
INSERT INTO task_members (task_id, user_id, part, submission_link, score, feedback, submitted_at, graded_at)
VALUES
(
    1,
    2,
    'Frontend Create Team Task UI',
    'https://example.com/emna-frontend-submission',
    88,
    'Good frontend implementation and UI flow.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    1,
    3,
    'Backend Team Task API',
    'https://example.com/abdul-backend-submission',
    90,
    'Backend routes and API structure are well implemented.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    1,
    4,
    'Auth and Role Protection',
    'https://example.com/mayaz-auth-submission',
    87,
    'Good role-based access control for team task permissions.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    1,
    5,
    'Data Layer Schema and JOIN Queries',
    'https://example.com/mudassir-data-layer-submission',
    92,
    'Strong database design with clear relationships and JOIN queries.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);