-- ============================================
-- ADD FAKE TUTORS TO DATABASE
-- Run this in Supabase SQL Editor to populate your database with test tutors
-- ============================================

-- Insert fake tutor profiles
-- Note: These use generated UUIDs. They won't have login credentials unless you create auth users separately.

INSERT INTO public.profiles (id, name, email, major, graduation_year, department, bio, is_tutor, hourly_rate, location, availability, locations, specializations, is_verified, student_id) VALUES

-- Verified Tutors (will appear first in search)
(gen_random_uuid(), 'Alex Chen', 'achen@wisc.edu', 'Computer Sciences', 2025, 'COMP SCI',
 'Senior CS major with 3 years of tutoring experience. Specializing in data structures, algorithms, and Java programming. Former TA for CS400.',
 true, 45.00, 'Memorial Union',
 '["Monday 2-5pm", "Wednesday 3-6pm", "Friday 1-4pm"]'::jsonb,
 '["Memorial Union", "College Library", "Online"]'::jsonb,
 '["CS400", "CS300", "CS540", "Data Structures", "Algorithms"]'::jsonb,
 true, '1234567890'),

(gen_random_uuid(), 'Sarah Martinez', 'smartinez@wisc.edu', 'Mathematics', 2026, 'MATH',
 'Graduate student in applied mathematics. Passionate about making calculus and linear algebra accessible. 4+ years teaching experience.',
 true, 50.00, 'Van Vleck Hall',
 '["Tuesday 10am-1pm", "Thursday 2-5pm", "Saturday 10am-2pm"]'::jsonb,
 '["Van Vleck Hall", "Helen C. White Library", "Online"]'::jsonb,
 '["MATH221", "MATH222", "MATH340", "Calculus", "Linear Algebra"]'::jsonb,
 true, '2345678901'),

(gen_random_uuid(), 'Michael Johnson', 'mjohnson@wisc.edu', 'Statistics', 2025, 'STAT',
 'Statistics major with strong programming skills in R and Python. Love helping students understand probability and statistical inference.',
 true, 40.00, 'Social Science Building',
 '["Monday 3-6pm", "Wednesday 1-4pm", "Friday 2-5pm"]'::jsonb,
 '["Social Science Building", "College Library", "Online"]'::jsonb,
 '["STAT240", "STAT324", "STAT340", "R Programming", "Data Analysis"]'::jsonb,
 true, '3456789012'),

(gen_random_uuid(), 'David Kim', 'dkim@wisc.edu', 'Computer Sciences & Mathematics', 2025, 'COMP SCI',
 'Double major in CS and Math. Specialize in theoretical CS, algorithms, and discrete math. Former Google intern.',
 true, 55.00, 'Computer Sciences Building',
 '["Monday 1-4pm", "Wednesday 2-5pm"]'::jsonb,
 '["Computer Sciences Building", "Memorial Library", "Online"]'::jsonb,
 '["CS577", "CS540", "MATH341", "Algorithms", "Discrete Math"]'::jsonb,
 true, '5678901234'),

(gen_random_uuid(), 'Jessica Taylor', 'jtaylor@wisc.edu', 'Electrical and Computer Engineering', 2026, 'E C E',
 'ECE junior passionate about helping students with digital logic and computer architecture. Patient and detail-oriented.',
 true, 42.00, 'Engineering Hall',
 '["Tuesday 1-4pm", "Friday 3-6pm"]'::jsonb,
 '["Engineering Hall", "Online"]'::jsonb,
 '["ECE252", "CS354", "Digital Logic", "Computer Architecture"]'::jsonb,
 true, '6789012345'),

(gen_random_uuid(), 'Olivia Brown', 'obrown@wisc.edu', 'Physics', 2025, 'PHYSICS',
 'Physics senior with tutoring experience at UW Learning Center. Specialize in mechanics and electromagnetism.',
 true, 43.00, 'Chamberlin Hall',
 '["Tuesday 2-5pm", "Thursday 1-4pm"]'::jsonb,
 '["Chamberlin Hall", "Van Vleck Hall", "Online"]'::jsonb,
 '["PHYSICS201", "PHYSICS202", "Mechanics", "Electromagnetism"]'::jsonb,
 true, '8901234567'),

(gen_random_uuid(), 'Ryan Patel', 'rpatel@wisc.edu', 'Computer Sciences', 2026, 'COMP SCI',
 'CS junior focusing on AI and machine learning. Completed research internship at UW AI Lab. Love teaching ML concepts.',
 true, 48.00, 'Computer Sciences Building',
 '["Monday 3-6pm", "Thursday 2-5pm"]'::jsonb,
 '["Computer Sciences Building", "Discovery Building", "Online"]'::jsonb,
 '["CS540", "CS639", "Machine Learning", "Python", "TensorFlow"]'::jsonb,
 true, '9012345678'),

-- Unverified Tutors (will appear after verified ones)
(gen_random_uuid(), 'Emily Wong', 'ewong@wisc.edu', 'Data Science', 2027, 'DS',
 'Data Science sophomore with internship experience at Epic Systems. Excel at teaching Python and data visualization.',
 true, 35.00, 'Discovery Building',
 '["Tuesday 4-7pm", "Thursday 3-6pm"]'::jsonb,
 '["Discovery Building", "Online"]'::jsonb,
 '["DS200", "Python", "Data Visualization", "Pandas", "SQL"]'::jsonb,
 false, '4567890123'),

(gen_random_uuid(), 'Brandon Lee', 'blee@wisc.edu', 'Chemistry', 2025, 'CHEM',
 'Chemistry major with pre-med experience. Great at breaking down complex concepts in gen chem and organic chemistry.',
 true, 38.00, 'Chemistry Building',
 '["Monday 5-8pm", "Wednesday 4-7pm", "Sunday 2-5pm"]'::jsonb,
 '["Chemistry Building", "College Library"]'::jsonb,
 '["CHEM103", "CHEM104", "General Chemistry", "Lab Techniques"]'::jsonb,
 false, '7890123456'),

(gen_random_uuid(), 'Natalie Garcia', 'ngarcia@wisc.edu', 'Mathematics', 2026, 'MATH',
 'Math major with strong background in probability and statistics. Former peer mentor for MATH431.',
 true, 44.00, 'Van Vleck Hall',
 '["Tuesday 3-6pm", "Friday 1-4pm", "Saturday 11am-2pm"]'::jsonb,
 '["Van Vleck Hall", "Social Science Building", "Online"]'::jsonb,
 '["MATH431", "STAT324", "Probability", "Statistics", "Statistical Computing"]'::jsonb,
 false, '0123456789'),

(gen_random_uuid(), 'Thomas Anderson', 'tanderson@wisc.edu', 'Computer Sciences', 2025, 'COMP SCI',
 'CS senior with full-stack development experience. Can help with web development, databases, and software engineering.',
 true, 46.00, 'Computer Sciences Building',
 '["Wednesday 4-7pm", "Friday 2-5pm"]'::jsonb,
 '["Computer Sciences Building", "Online"]'::jsonb,
 '["CS564", "CS400", "Web Development", "SQL", "JavaScript"]'::jsonb,
 true, '1122334455'),

(gen_random_uuid(), 'Sophia Martinez', 'smartinez2@wisc.edu', 'Biology', 2026, 'BIOLOGY',
 'Biology major passionate about genetics and molecular biology. Patient tutor with lab experience.',
 true, 37.00, 'Biochemistry Building',
 '["Monday 1-4pm", "Thursday 3-6pm"]'::jsonb,
 '["Biochemistry Building", "Helen C. White Library"]'::jsonb,
 '["BIOLOGY151", "BIOLOGY152", "Genetics", "Lab Skills"]'::jsonb,
 true, '2233445566')

ON CONFLICT (email) DO NOTHING;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Fake tutors inserted successfully!';
  RAISE NOTICE 'Total tutors in database: %', (SELECT COUNT(*) FROM public.profiles WHERE is_tutor = true);
  RAISE NOTICE 'Verified tutors: %', (SELECT COUNT(*) FROM public.profiles WHERE is_tutor = true AND is_verified = true);
  RAISE NOTICE 'Unverified tutors: %', (SELECT COUNT(*) FROM public.profiles WHERE is_tutor = true AND is_verified = false);
END $$;
