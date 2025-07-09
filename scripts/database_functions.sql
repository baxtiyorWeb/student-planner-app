-- Database functions for enhanced functionality

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create `
triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate user statistics
CREATE OR REPLACE FUNCTION get_user_statistics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        -- Umumiy topshiriqlar soni
        'total_assignments', (
            SELECT COUNT(*) FROM assignments WHERE user_id = user_uuid
        ),

        -- Bajarilgan topshiriqlar soni
        'completed_assignments', (
            SELECT COUNT(*) FROM assignments WHERE user_id = user_uuid AND completed = true
        ),

        -- Faol (arxivlanmagan) fanlar soni
        'total_subjects', (
            SELECT COUNT(*) FROM subjects WHERE user_id = user_uuid AND is_archived = false
        ),

        -- Umumiy o‘qish vaqti (soatlarda)
        'total_study_hours', (
            SELECT COALESCE(SUM(duration_minutes), 0) / 60.0 FROM study_sessions WHERE user_id = user_uuid
        ),

        -- Joriy streak
        'current_streak', (
            SELECT COALESCE(streak_days, 0) FROM users WHERE id = user_uuid
        ),

        -- Eng uzoq streak
        'longest_streak', (
            SELECT COALESCE(longest_streak, 0) FROM users WHERE id = user_uuid
        ),

        -- Bugun uchun deadline'ga ega topshiriqlar (bajarilmagan)
        'assignments_due_today', (
            SELECT COUNT(*) FROM assignments WHERE user_id = user_uuid AND deadline = CURRENT_DATE AND completed = false
        ),

        -- O‘tgan topshiriqlar (deadline o‘tgan, hali bajarilmagan)
        'assignments_overdue', (
            SELECT COUNT(*) FROM assignments WHERE user_id = user_uuid AND deadline < CURRENT_DATE AND completed = false
        ),

        -- O‘rtacha mahsuldorlik (faqat baholangan sessiyalar bo‘yicha)
        'average_productivity', (
            SELECT COALESCE(AVG(productivity_rating), 0) FROM study_sessions WHERE user_id = user_uuid AND productivity_rating IS NOT NULL
        ),

        -- Shu haftada boshlangan o‘quv sessiyalar soni
        'study_sessions_this_week', (
            SELECT COUNT(*) FROM study_sessions WHERE user_id = user_uuid AND start_time >= date_trunc('week', CURRENT_DATE)
        ),

        -- Erishilgan maqsadlar soni
        'goals_achieved', (
            SELECT COUNT(*) FROM goals WHERE user_id = user_uuid AND is_achieved = true
        ),

        -- Umumiy maqsadlar soni
        'total_goals', (
            SELECT COUNT(*) FROM goals WHERE user_id = user_uuid
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update study streak
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
    has_study BOOLEAN;
BEGIN
    -- Calculate current streak
    LOOP
        SELECT EXISTS(
            SELECT 1 FROM study_streaks 
            WHERE user_id = user_uuid 
            AND streak_date = check_date 
            AND study_minutes >= 30
        ) INTO has_study;
        
        IF NOT has_study THEN
            EXIT;
        END IF;
        
        current_streak := current_streak + 1;
        check_date := check_date - INTERVAL '1 day';
    END LOOP;
    
    -- Update user streak
    UPDATE users 
    SET 
        streak_days = current_streak,
        longest_streak = GREATEST(longest_streak, current_streak)
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to create automatic notifications
CREATE OR REPLACE FUNCTION create_deadline_notifications()
RETURNS VOID AS $$
BEGIN
    -- Create notifications for assignments due in 3 days
    INSERT INTO notifications (user_id, assignment_id, type, title, message, priority, scheduled_for)
    SELECT 
        a.user_id,
        a.id,
        'deadline_reminder',
        'Deadline Reminder',
        'Assignment "' || a.title || '" is due in 3 days',
        2,
        NOW()
    FROM assignments a
    WHERE a.deadline = CURRENT_DATE + INTERVAL '3 days'
    AND a.completed = false
    AND a.reminder_sent = false
    AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.assignment_id = a.id 
        AND n.type = 'deadline_reminder'
    );
    
    -- Mark reminders as sent
    UPDATE assignments 
    SET reminder_sent = true 
    WHERE deadline = CURRENT_DATE + INTERVAL '3 days'
    AND completed = false;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old data
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS VOID AS $$
BEGIN
    -- Archive completed assignments older than 6 months
    UPDATE assignments 
    SET notes = COALESCE(notes, '') || ' [Archived on ' || CURRENT_DATE || ']'
    WHERE completed = true 
    AND completed_at < CURRENT_DATE - INTERVAL '6 months';
    
    -- Delete old analytics data (older than 1 year)
    DELETE FROM user_analytics 
    WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Delete old notifications (older than 3 months)
    DELETE FROM notifications 
    WHERE created_at < CURRENT_DATE - INTERVAL '3 months'
    AND read_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
