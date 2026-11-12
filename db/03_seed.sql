INSERT INTO users(email,password_hash,role) VALUES
 ('admin@scholarship.edu', crypt('Admin@2026', gen_salt('bf')), 'admin'),
 ('reviewer1@scholarship.edu', crypt('Review1@2026', gen_salt('bf')), 'reviewer'),
 ('reviewer2@scholarship.edu', crypt('Review2@2026', gen_salt('bf')), 'reviewer');
INSERT INTO providers(user_id,name,type) VALUES
 ((SELECT user_id FROM users WHERE email='reviewer1@scholarship.edu'),'National Scholarship Portal','government'),
 ((SELECT user_id FROM users WHERE email='reviewer2@scholarship.edu'),'Tata Education Trust','private'),
 (NULL,'Women in STEM Foundation','ngo');

INSERT INTO scholarships(provider_id,title,description,amount,total_budget,seats,deadline) VALUES
 (1,'Merit Scholarship for Engineering','Merit based aid for engineering students with outstanding academic performance in computer science and electronics.',50000,500000,10,CURRENT_DATE+60),
 (1,'Post Matric SC/ST Scholarship','Financial support for SC and ST students from low income families pursuing any undergraduate degree.',30000,600000,20,CURRENT_DATE+45),
 (1,'EWS Support Grant','Grant for economically weaker students to cover tuition and hostel fees.',25000,250000,10,CURRENT_DATE+30),
 (2,'Tata Future Technologists','For students passionate about artificial intelligence, machine learning, data science and software research.',80000,400000,5,CURRENT_DATE+50),
 (2,'Rural Talent Scholarship','Supports talented students from Karnataka and Tamil Nadu with good grades and financial need.',40000,400000,10,CURRENT_DATE+40),
 (3,'Women in STEM Award','Encouraging women pursuing science, technology, engineering and mathematics careers, robotics and coding.',60000,300000,5,CURRENT_DATE+55),
 (3,'Disability Empowerment Scholarship','Assistance for students with disabilities in any course to access quality higher education.',45000,450000,10,CURRENT_DATE+35),
 (2,'Medical Aspirants Fund','For MBBS and nursing students with strong academics in biology and healthcare research.',70000,350000,5,CURRENT_DATE+25),
 (1,'Final Year Research Grant','Research funding for final year students working on innovative projects in engineering and science.',35000,350000,10,CURRENT_DATE+70),
 (2,'Expired Demo Scholarship','Old scholarship kept to demonstrate deadline trigger.',10000,100000,5,CURRENT_DATE-10);

INSERT INTO eligibility_criteria(scholarship_id,max_income,min_cgpa,allowed_categories,allowed_states,allowed_courses,min_year,max_year,gender,disability_only) VALUES
 (1,800000,8.5,NULL,NULL,ARRAY['B.Tech CSE','B.Tech ECE'],NULL,NULL,NULL,FALSE),
 (2,250000,6.0,ARRAY['SC','ST'],NULL,NULL,NULL,NULL,NULL,FALSE),
 (3,300000,6.5,ARRAY['EWS','GEN'],NULL,NULL,NULL,NULL,NULL,FALSE),
 (4,600000,8.0,NULL,NULL,ARRAY['B.Tech CSE','B.Tech ECE','BCA'],2,NULL,NULL,FALSE),
 (5,400000,7.5,NULL,ARRAY['Karnataka','Tamil Nadu'],NULL,NULL,NULL,NULL,FALSE),
 (6,700000,7.0,NULL,NULL,ARRAY['B.Tech CSE','B.Tech ECE','BCA'],NULL,NULL,'female',FALSE),
 (7,NULL,5.5,NULL,NULL,NULL,NULL,NULL,NULL,TRUE),
 (8,500000,7.5,NULL,NULL,ARRAY['MBBS','B.Sc Nursing'],NULL,NULL,NULL,FALSE),
 (9,NULL,8.0,NULL,NULL,NULL,4,4,NULL,FALSE),
 (10,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,FALSE);

INSERT INTO users(email,password_hash,role)
SELECT 'student'||i||'@test.com', crypt('Password@123', gen_salt('bf')), 'student' FROM generate_series(1,30) i;
INSERT INTO students(user_id,full_name,dob,gender,category,state,annual_family_income,disability,course,year_of_study,cgpa,interests)
SELECT u.user_id, 'Student '||i, DATE '2003-01-01'+(i*40),
  (ARRAY['male','female','other'])[1+i%3],
  (ARRAY['GEN','OBC','SC','ST','EWS'])[1+i%5],
  (ARRAY['Karnataka','Tamil Nadu','Kerala','Maharashtra'])[1+i%4],
  100000 + (i*37000), (i%10=0),
  (ARRAY['B.Tech CSE','B.Tech ECE','BCA','MBBS','B.Sc Nursing'])[1+i%5],
  1+(i%4), ROUND((6 + (i%35)/10.0)::numeric,2),
  (ARRAY['machine learning and AI','robotics and coding','healthcare research','data science','electronics and embedded systems'])[1+i%5]
FROM generate_series(1,30) i JOIN users u ON u.email='student'||i||'@test.com';
