db = db.getSiblingDB('scholarship_logs');

['scholarship_rules', 'audit_logs', 'notifications', 'document_meta'].forEach((n) => {
  if (!db.getCollectionNames().includes(n)) db.createCollection(n);
});

db.scholarship_rules.createIndex({ scholarshipId: 1 }, { unique: true });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });
db.notifications.createIndex({ studentId: 1, read: 1 });
db.document_meta.createIndex({ applicationId: 1 });

db.scholarship_rules.deleteMany({});
db.scholarship_rules.insertMany([
  { scholarshipId: 1, rules: [{ field: 'cgpa', op: '>=', value: 8.5 }], requiredDocs: ['marksheet', 'income_certificate'] },
  { scholarshipId: 2, rules: [{ field: 'category', op: 'in', value: ['SC', 'ST'] }], requiredDocs: ['caste_certificate', 'income_certificate'] },
  { scholarshipId: 6, rules: [{ field: 'gender', op: '==', value: 'female' }], requiredDocs: ['marksheet'] },
]);

db.audit_logs.insertMany([
  { userId: 4, action: 'login', timestamp: new Date() },
  { userId: 4, action: 'apply', scholarshipId: 1, timestamp: new Date() },
  { userId: 2, action: 'approve', applicationId: 1, timestamp: new Date() },
  { userId: 5, action: 'reject', applicationId: 2, reason: 'low_cgpa', timestamp: new Date() },
]);

db.notifications.insertOne({ studentId: 1, message: 'Deadline in 3 days', read: false, createdAt: new Date() });
db.document_meta.insertOne({ applicationId: 1, type: 'marksheet', file: 'marksheet_1.pdf', uploadedAt: new Date() });

print('MongoDB setup complete');
