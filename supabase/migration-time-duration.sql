-- Add 'time_duration' field type for tracking time spent on habits
ALTER TABLE habit_field_definitions
DROP CONSTRAINT habit_field_definitions_field_type_check;

ALTER TABLE habit_field_definitions
ADD CONSTRAINT habit_field_definitions_field_type_check
CHECK (field_type IN (
    'text', 'number', 'rating', 'boolean', 'select',
    'slider', 'date', 'link', 'long_text', 'time_duration'
));
