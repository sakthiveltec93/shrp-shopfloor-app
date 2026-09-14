-- Grant the new "attendance" page to every existing user (everyone needs to
-- check in). Safe to re-run.
INSERT INTO user_page_access (user_id, page_key)
SELECT id, 'attendance' FROM users
ON CONFLICT (user_id, page_key) DO NOTHING;
