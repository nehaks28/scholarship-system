CREATE OR REPLACE FUNCTION fn_eligibility_check(p_student_id INT)
RETURNS TABLE (scholarship_id INT, title TEXT, amount NUMERIC, deadline DATE,
               eligible BOOLEAN, failed_reasons TEXT[]) AS $$
  SELECT s.scholarship_id, s.title::TEXT, s.amount, s.deadline,
         cardinality(r.reasons) = 0, r.reasons
  FROM students st
  CROSS JOIN scholarships s
  LEFT JOIN eligibility_criteria c ON c.scholarship_id = s.scholarship_id
  CROSS JOIN LATERAL (
    SELECT array_remove(ARRAY[
      CASE WHEN NOT s.is_active THEN 'Scholarship is closed' END,
      CASE WHEN s.deadline < CURRENT_DATE THEN 'Deadline passed' END,
      CASE WHEN s.seats <= 0 THEN 'No seats left' END,
      CASE WHEN c.max_income IS NOT NULL AND st.annual_family_income > c.max_income
           THEN 'Income above limit ' || c.max_income END,
      CASE WHEN c.min_cgpa IS NOT NULL AND st.cgpa < c.min_cgpa
           THEN 'CGPA below ' || c.min_cgpa END,
      CASE WHEN c.allowed_categories IS NOT NULL AND NOT (st.category = ANY(c.allowed_categories))
           THEN 'Category not allowed' END,
      CASE WHEN c.allowed_states IS NOT NULL AND NOT (st.state = ANY(c.allowed_states))
           THEN 'State not allowed' END,
      CASE WHEN c.allowed_courses IS NOT NULL AND NOT (st.course = ANY(c.allowed_courses))
           THEN 'Course not allowed' END,
      CASE WHEN c.min_year IS NOT NULL AND st.year_of_study < c.min_year THEN 'Year too low' END,
      CASE WHEN c.max_year IS NOT NULL AND st.year_of_study > c.max_year THEN 'Year too high' END,
      CASE WHEN c.gender IS NOT NULL AND st.gender <> c.gender THEN 'Gender mismatch' END,
      CASE WHEN c.disability_only AND NOT st.disability THEN 'Only for students with disability' END
    ], NULL) AS reasons
  ) r
  WHERE st.student_id = p_student_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION trg_check_application() RETURNS trigger AS $$
DECLARE v RECORD;
BEGIN
  SELECT * INTO v FROM scholarships WHERE scholarship_id = NEW.scholarship_id;
  IF v.deadline < CURRENT_DATE THEN RAISE EXCEPTION 'Deadline has passed'; END IF;
  IF NOT v.is_active THEN RAISE EXCEPTION 'Scholarship is not active'; END IF;
  IF v.seats <= 0 THEN RAISE EXCEPTION 'No seats remaining'; END IF;
  IF NOT (SELECT eligible FROM fn_eligibility_check(NEW.student_id)
          WHERE scholarship_id = NEW.scholarship_id) THEN
    RAISE EXCEPTION 'Student not eligible for this scholarship';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER before_application_insert BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION trg_check_application();

CREATE OR REPLACE FUNCTION trg_log_status() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO application_status_history(application_id, old_status, new_status)
    VALUES (NEW.application_id, NULL, NEW.status);
  ELSIF NEW.status <> OLD.status THEN
    INSERT INTO application_status_history(application_id, old_status, new_status)
    VALUES (NEW.application_id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER after_application_change AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION trg_log_status();

CREATE OR REPLACE FUNCTION sp_approve_application(p_app_id INT, p_reviewer_id INT)
RETURNS VOID AS $$
DECLARE a applications%ROWTYPE; s scholarships%ROWTYPE;
BEGIN
  SELECT * INTO a FROM applications WHERE application_id = p_app_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;
  IF a.status NOT IN ('submitted','under_review') THEN
    RAISE EXCEPTION 'Application already %', a.status; END IF;
  SELECT * INTO s FROM scholarships WHERE scholarship_id = a.scholarship_id FOR UPDATE;
  IF s.seats <= 0 THEN RAISE EXCEPTION 'No seats left'; END IF;
  IF s.total_budget < s.amount THEN RAISE EXCEPTION 'Insufficient budget'; END IF;
  INSERT INTO awards(application_id, amount) VALUES (p_app_id, s.amount);
  UPDATE scholarships SET seats = seats - 1, total_budget = total_budget - amount
    WHERE scholarship_id = s.scholarship_id;
  UPDATE applications SET status = 'approved' WHERE application_id = p_app_id;
  INSERT INTO reviews(application_id, reviewer_id, comments)
    VALUES (p_app_id, p_reviewer_id, 'Approved')
    ON CONFLICT (application_id) DO UPDATE SET comments = 'Approved', reviewer_id = p_reviewer_id;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW v_scholarship_stats AS
SELECT s.scholarship_id, s.title, s.seats, s.total_budget,
       COUNT(a.application_id) AS total_apps,
       COUNT(*) FILTER (WHERE a.status = 'approved') AS approved,
       ROUND(100.0 * COUNT(*) FILTER (WHERE a.status = 'approved')
             / NULLIF(COUNT(a.application_id), 0), 1) AS approval_rate
FROM scholarships s LEFT JOIN applications a USING (scholarship_id)
GROUP BY s.scholarship_id;

CREATE OR REPLACE VIEW v_student_dashboard AS
SELECT st.student_id, st.full_name, a.application_id, s.title, a.status, a.applied_at, aw.amount AS awarded
FROM students st
JOIN applications a USING (student_id)
JOIN scholarships s USING (scholarship_id)
LEFT JOIN awards aw USING (application_id);
