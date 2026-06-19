import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', MessageSchema);
export default Message;
