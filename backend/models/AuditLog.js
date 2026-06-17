import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true }, // PROMOTE, DEMOTE, BAN, UNBAN, APPROVE_WORKER, SUSPEND_WORKER, REJECT_WORKER, REMOVE_USER
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetName: { type: String },
  details: { type: String },
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
