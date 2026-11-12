SELECT * FROM fn_eligibility_check(1);
SELECT p.name, COUNT(*) n, SUM(s.amount) total_amount
FROM providers p JOIN scholarships s USING (provider_id) GROUP BY p.name HAVING COUNT(*) > 1 ORDER BY n DESC;
SELECT title, amount FROM scholarships WHERE amount > (SELECT AVG(amount) FROM scholarships);
SELECT course, COUNT(*), ROUND(AVG(cgpa),2) FROM students GROUP BY course ORDER BY 3 DESC;
SELECT * FROM v_scholarship_stats WHERE approval_rate > 50;
SELECT title, ts_rank(search_tsv, q) r FROM scholarships, plainto_tsquery('english','robotics coding') q
WHERE search_tsv @@ q ORDER BY r DESC;
