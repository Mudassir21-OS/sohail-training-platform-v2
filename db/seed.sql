-- =====================================================
-- Sohail Training Platform v2
-- Data Layer: Sample Seed Data
-- Author: Mudassir Shahab
-- =====================================================

-- Insert sample users
INSERT INTO users (name, email, password_hash, role)
VALUES
('Admin User', 'admin@sohail.com', 'hashed_admin_password', 'admin'),
('Ali Trainee', 'ali@sohail.com', 'hashed_ali_password', 'trainee'),
('Sara Trainee', 'sara@sohail.com', 'hashed_sara_password', 'trainee');

-- Insert sample tasks
INSERT INTO tasks (title, description, created_by, assigned_to, deadline, status)
VALUES
('Build Login Page', 'Create a login page for the training platform.', 1, 2, '2026-06-25', 'graded'),
('Create Submission Form', 'Build a form where trainees can submit assigned tasks.', 1, 3, '2026-06-25', 'submitted'),
('Database Schema Design', 'Design relational tables and foreign key relationships.', 1, 2, '2026-06-25', 'assigned');

-- Insert sample submissions
INSERT INTO submissions (task_id, trainee_id, submission_text, file_url)
VALUES
(1, 2, 'I completed the login page with email and password fields.', NULL),
(2, 3, 'I completed the submission form and connected it to frontend state.', NULL);

-- Insert sample scores
INSERT INTO scores (submission_id, graded_by, score, feedback)
VALUES
(1, 1, 88, 'Good work. Login page is functional and clean.');