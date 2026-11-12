# Test cases

Fill the Actual and Result columns while testing and attach a screenshot for each.

| ID | Area | Description | Input | Expected | Actual | Result |
|---|---|---|---|---|---|---|
| T1 | DDL | Tables created | `\dt` | 12 tables | | |
| T2 | Seed | Data loaded | count query | 33 users, 30 students, 10 scholarships | | |
| T3 | Function | Eligibility with reasons | `fn_eligibility_check(1)` | 10 rows, reasons for failures | | |
| T4 | Trigger | Expired deadline blocked | insert application for scholarship 10 | ERROR Deadline has passed | | |
| T5 | Constraint | Invalid CGPA | update cgpa = 15 | CHECK constraint error | | |
| T6 | Trigger | Status history logged | valid application insert | 1 history row, status submitted | | |
| T7 | Constraint | Duplicate application | same insert again | duplicate key error | | |
| T8 | Transaction | Approval | `sp_approve_application(1,2)` | award row, status approved, seats and budget reduced | | |
| T9 | Transaction | Double approval | run again | ERROR Application already approved | | |
| T10 | Transaction | Rollback on low budget | budget = 0, then approve | ERROR Insufficient budget, status unchanged | | |
| T11 | View | Scholarship stats | select from `v_scholarship_stats` | rows with approval rate | | |
| T12 | Full-text | Keyword search | robotics coding | matching scholarship first | | |
| T13 | Security | Password hashing | select password_hash | starts with $2a$ | | |
| T14 | Vector | Embeddings exist | count | 10 or more | | |
| W1 | UI | Register student | valid form | redirected to login | | |
| W2 | UI | DB validation | CGPA 15 | error shown, no account | | |
| W3 | Auth | Wrong password | bad login | Invalid email or password | | |
| W4 | UI | Eligibility cards | student login | green and red cards with reasons | | |
| W5 | UI | Search | robotics | match shown | | |
| W6 | Security | SQL injection | search `' OR 1=1 --` | no results, no crash | | |
| W7 | UI | Filter | only eligible, min amount | cards filtered | | |
| W8 | UI | Recommendations | AI interests | AI scholarship ranked high with Match % | | |
| W9 | UI | Apply | click Apply | submitted, listed in My applications | | |
| W10 | UI | Duplicate apply | after applying | Apply button replaced by Applied tag (duplicate row also blocked by T7) | | |
| W11 | Auth | Role protection | student opens /api/stats | Forbidden | | |
| W12 | UI | Approve | reviewer approves | leaves queue | | |
| W13 | UI | Notification | student after decision | message shown | | |
| W14 | UI | Create scholarship | reviewer form | created, appears in student cards | | |
| W15 | UI | Edit scholarship | change amount | updated in list | | |
| W16 | UI | Delete scholarship | delete one with no applications | removed | | |
| W17 | Integrity | Delete with applications | delete one that has applications | foreign key error shown | | |
| W18 | UI | Admin dashboard | admin login | stats and activity tables | | |
| M1 | MongoDB | Audit aggregation | `aggregations.js` | counts per action | | |
| M2 | MongoDB | Notifications stored | find notifications | documents present | | |
