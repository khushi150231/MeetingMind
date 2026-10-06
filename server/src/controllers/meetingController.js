const Meeting = require('../models/Meeting');

// Helper to normalize participants
const parseParticipants = (participants) => {
  if (Array.isArray(participants)) {
    return participants.map((p) => String(p).trim()).filter(Boolean);
  }
  if (typeof participants === 'string') {
    return participants
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
};

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res, next) => {
  try {
    const {
      title,
      date,
      participants,
      transcript,
      summary,
      keyPoints,
      decisions,
      actionItems,
      followUps,
      status
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meeting title is required'
      });
    }

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meeting transcript is required'
      });
    }

    const meeting = await Meeting.create({
      userId: req.user._id,
      title: title.trim(),
      date: date ? new Date(date) : new Date(),
      participants: parseParticipants(participants),
      transcript: transcript.trim(),
      summary: summary || '',
      keyPoints: Array.isArray(keyPoints) ? keyPoints : [],
      decisions: Array.isArray(decisions) ? decisions : [],
      actionItems: Array.isArray(actionItems) ? actionItems : [],
      followUps: Array.isArray(followUps) ? followUps : [],
      status: status || 'Draft'
    });

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all meetings for the logged-in user with filters, search, sort
// @route   GET /api/meetings
// @access  Private
const getAllMeetings = async (req, res, next) => {
  try {
    const { search, status, sort, dateFrom, dateTo } = req.query;

    const query = { userId: req.user._id };

    // Status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.date.$lte = to;
      }
    }

    // Search query across title, transcript, and summary
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { transcript: searchRegex },
        { participants: searchRegex }
      ];
    }

    // Sorting
    const sortOption = sort === 'oldest' ? { date: 1 } : { date: -1, createdAt: -1 };

    const meetings = await Meeting.find(query).sort(sortOption);

    res.json({
      success: true,
      count: meetings.length,
      meetings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
const getSingleMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Security ownership check
    if (meeting.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this meeting'
      });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
const updateMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Security ownership check
    if (meeting.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to update this meeting'
      });
    }

    const {
      title,
      date,
      participants,
      transcript,
      summary,
      keyPoints,
      decisions,
      actionItems,
      followUps,
      status
    } = req.body;

    if (title !== undefined) meeting.title = title.trim();
    if (date !== undefined) meeting.date = new Date(date);
    if (participants !== undefined) meeting.participants = parseParticipants(participants);
    if (transcript !== undefined) meeting.transcript = transcript;
    if (summary !== undefined) meeting.summary = summary;
    if (keyPoints !== undefined) meeting.keyPoints = keyPoints;
    if (decisions !== undefined) meeting.decisions = decisions;
    if (actionItems !== undefined) meeting.actionItems = actionItems;
    if (followUps !== undefined) meeting.followUps = followUps;
    if (status !== undefined) meeting.status = status;

    const updatedMeeting = await meeting.save();

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      meeting: updatedMeeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
const deleteMeeting = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Security ownership check
    if (meeting.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to delete this meeting'
      });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single action item status within a meeting
// @route   PATCH /api/meetings/:id/action-items/:itemId
// @access  Private
const updateActionItemStatus = async (req, res, next) => {
  try {
    const { status, task, owner, deadline, priority } = req.body;
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    if (meeting.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const actionItem = meeting.actionItems.id(req.params.itemId);
    if (!actionItem) {
      return res.status(404).json({
        success: false,
        message: 'Action item not found'
      });
    }

    if (status) actionItem.status = status;
    if (task) actionItem.task = task;
    if (owner !== undefined) actionItem.owner = owner;
    if (deadline !== undefined) actionItem.deadline = deadline;
    if (priority) actionItem.priority = priority;

    await meeting.save();

    res.json({
      success: true,
      message: 'Action item updated',
      actionItem,
      meeting
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics & statistics
// @route   GET /api/meetings/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const meetings = await Meeting.find({ userId }).sort({ date: -1, createdAt: -1 });

    const totalMeetings = meetings.length;
    const processedMeetings = meetings.filter((m) => m.status === 'Processed').length;

    let pendingActionItems = 0;
    let completedActionItems = 0;
    let inProgressActionItems = 0;

    meetings.forEach((m) => {
      (m.actionItems || []).forEach((item) => {
        if (item.status === 'Completed') {
          completedActionItems++;
        } else if (item.status === 'In Progress') {
          inProgressActionItems++;
        } else {
          pendingActionItems++;
        }
      });
    });

    const recentMeetings = meetings.slice(0, 5).map((m) => ({
      _id: m._id,
      title: m.title,
      date: m.date,
      status: m.status,
      actionItemsCount: (m.actionItems || []).length,
      decisionsCount: (m.decisions || []).length
    }));

    res.json({
      success: true,
      stats: {
        totalMeetings,
        processedMeetings,
        pendingActionItems,
        completedActionItems,
        inProgressActionItems
      },
      recentMeetings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMeeting,
  getAllMeetings,
  getSingleMeeting,
  updateMeeting,
  deleteMeeting,
  updateActionItemStatus,
  getDashboardStats
};
