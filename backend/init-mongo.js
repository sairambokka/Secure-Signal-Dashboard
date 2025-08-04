db = db.getSiblingDB('signal_dashboard');

db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'signal_dashboard'
    }
  ]
});

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.signals.createIndex({ user_id: 1, timestamp: -1 });
db.signals.createIndex({ user_id: 1, signal_type: 1 });