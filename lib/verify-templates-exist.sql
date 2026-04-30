-- Check if templates exist
SELECT COUNT(*) as total_templates FROM message_templates;

-- Show all templates
SELECT id, name, category, language, LEFT(message_text, 50) as preview, is_active
FROM message_templates
ORDER BY category, language;
