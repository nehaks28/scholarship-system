db = db.getSiblingDB('scholarship_logs');

print('--- Events by action ---');
printjson(db.audit_logs.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray());

print('--- Rejections by reason ---');
printjson(db.audit_logs.aggregate([{ $match: { action: 'reject' } }, { $group: { _id: '$reason', count: { $sum: 1 } } }]).toArray());

print('--- Activity per day ---');
printjson(db.audit_logs.aggregate([
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, events: { $sum: 1 } } },
  { $sort: { _id: 1 } },
]).toArray());

print('--- Unread notifications per student ---');
printjson(db.notifications.aggregate([{ $match: { read: false } }, { $group: { _id: '$studentId', unread: { $sum: 1 } } }]).toArray());
