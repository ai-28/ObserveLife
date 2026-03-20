-- Seed prompts data
-- Based on categories from FlowGuide

-- General prompts
INSERT INTO prompts (category, text, care_type) VALUES
('CHILDHOOD', 'What is your earliest memory?', NULL),
('CHILDHOOD', 'What was your childhood home like?', NULL),
('CHILDHOOD', 'Tell me about your favorite childhood game or toy.', NULL),
('CHILDHOOD', 'What was school like when you were young?', NULL),

('FAMILY', 'Tell me about your parents.', NULL),
('FAMILY', 'How did you meet your spouse?', NULL),
('FAMILY', 'What do you want us to know about our family history?', NULL),
('FAMILY', 'What traditions did your family have?', NULL),

('WISDOM', 'What is the best advice you ever received?', NULL),
('WISDOM', 'What have you learned about life that you want to pass on?', NULL),
('WISDOM', 'What would you tell your younger self?', NULL),
('WISDOM', 'What makes a good life?', NULL),

('CAREER', 'What was your first job?', NULL),
('CAREER', 'What work are you most proud of?', NULL),
('CAREER', 'Tell me about a challenge you overcame at work.', NULL),

('LIFE', 'What are you most grateful for in your life?', NULL),
('LIFE', 'What was the happiest moment of your life?', NULL),
('LIFE', 'What accomplishment are you most proud of?', NULL);

-- Hospice-specific prompts
INSERT INTO prompts (category, text, care_type) VALUES
('GRATITUDE', 'What are you most grateful for in your life?', 'HOSPICE'),
('FAMILY', 'What do you want your family to know about how much they meant to you?', 'HOSPICE'),
('WISDOM', 'What have you learned about life that you want to pass on?', 'HOSPICE'),
('LEGACY', 'What do you hope people will remember about you?', 'HOSPICE'),
('LEGACY', 'What values do you want to leave behind?', 'HOSPICE');
