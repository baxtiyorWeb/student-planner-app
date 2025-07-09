-- Database functions for enhanced functionality

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON public.subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.assignments;
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_subjects', (
            SELECT COUNT(*) 
            FROM public.subjects 
            WHERE user_id = user_uuid AND is_archived = false
        ),
        'total_assignments', (
            SELECT COUNT(*) 
            FROM public.assignments 
            WHERE user_id = user_uuid
        ),
        'completed_assignments', (
            SELECT COUNT(*) 
            FROM public.assignments 
            WHERE user_id = user_uuid AND status = 'completed'
        ),
        'overdue_assignments', (
            SELECT COUNT(*) 
            FROM public.assignments 
            WHERE user_id = user_uuid 
                AND status != 'completed' 
                AND due_date < NOW()
        ),
        'upcoming_deadlines', (
            SELECT COUNT(*) 
            FROM public.assignments 
            WHERE user_id = user_uuid 
                AND status != 'completed'
                AND due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
        ),
        'weekly_study_hours', (
            SELECT COALESCE(ROUND(SUM(duration_minutes) / 60.0, 1), 0)
            FROM public.study_sessions 
            WHERE user_id = user_uuid 
                AND start_time >= date_trunc('week', NOW())
        ),
        'current_streak', (
            SELECT streak_days 
            FROM public.users 
            WHERE id = user_uuid
        ),
        'total_goals', (
            SELECT COUNT(*) 
            FROM public.goals 
            WHERE user_id = user_uuid
        ),
        'completed_goals', (
            SELECT COUNT(*) 
            FROM public.goals 
            WHERE user_id = user_uuid AND status = 'completed'
        ),
        'completion_rate', (
            SELECT CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0) / COUNT(*), 1)
            END
            FROM public.assignments 
            WHERE user_id = user_uuid
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
