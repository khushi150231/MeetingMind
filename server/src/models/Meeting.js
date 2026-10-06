const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true
    },
    owner: {
      type: String,
      default: null,
      trim: true
    },
    deadline: {
      type: String,
      default: null,
      trim: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending'
    }
  },
  { _id: true }
);

const meetingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    date: {
      type: Date,
      default: Date.now
    },
    participants: {
      type: [String],
      default: []
    },
    transcript: {
      type: String,
      required: [true, 'Meeting transcript is required']
    },
    summary: {
      type: String,
      default: ''
    },
    keyPoints: {
      type: [String],
      default: []
    },
    decisions: {
      type: [String],
      default: []
    },
    actionItems: {
      type: [actionItemSchema],
      default: []
    },
    followUps: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['Draft', 'Processing', 'Processed', 'Failed'],
      default: 'Draft',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual index for searching
meetingSchema.index({ title: 'text', transcript: 'text', summary: 'text' });

module.exports = mongoose.model('Meeting', meetingSchema);
