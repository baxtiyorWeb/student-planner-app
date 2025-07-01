-- Test foydalanuvchisi
INSERT INTO users (id, email, name, subscription_type) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'Test User', 'free')
ON CONFLICT (email) DO NOTHING;

-- Test fanlar
INSERT INTO subjects (id, user_id, name, description, color) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Matematika', 'Oliy matematika va analiz', 'bg-blue-500'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Dasturlash', 'Web dasturlash va React', 'bg-green-500'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Falsafa', 'Falsafa tarixi va mantiq', 'bg-purple-500')
ON CONFLICT DO NOTHING;

-- Test topshiriqlar
INSERT INTO assignments (user_id, subject_id, title, description, deadline, priority, completed) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Integral hisobini yakunlash', 'Aniq integrallar va ularning qo''llanilishi', '2024-01-15', 'high', false),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'React loyihasini tugatish', 'E-commerce saytini React bilan yaratish', '2024-01-15', 'medium', false),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'Faylasuflar haqida esse', 'Aristotel va Platonning falsafiy qarashlarini taqqoslash', '2024-01-18', 'low', false),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002', 'Algoritm tahlili', 'Sorting algoritmlarining vaqt murakkabligi', '2024-01-20', 'high', true)
ON CONFLICT DO NOTHING;
