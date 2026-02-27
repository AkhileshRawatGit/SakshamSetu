const PwDRequest = require('../models/PwDRequest');
const User = require('../models/User');
const Support = require('../models/Support');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Create a new assistive device request
 */
const createRequest = async (req, res, next) => {
  try {
    const { deviceType, aidName, description, priority, region } = req.body;
    const userId = req.user._id;

    // Get user location for region if not provided
    const user = await User.findById(userId);
    const requestRegion = region || user.location;

    const request = new PwDRequest({
      requestedBy: userId,
      deviceType,
      aidName,
      description,
      priority: priority || 'Medium',
      region: requestRegion,
      status: 'Pending',
    });

    await request.save();

    // Create notification for admin
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: 'New PwD Request',
        message: `A new request for ${aidName} has been submitted.`,
        type: 'Info',
        link: `/admin/requests/${request._id}`,
      });
    }

    // Create notification for PwD
    await Notification.create({
      userId: userId,
      title: 'Request Submitted',
      message: `Your request for ${aidName} has been submitted successfully.`,
      type: 'Success',
    });

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all requests for current PwD user
 */
const getMyRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const query = { requestedBy: userId };
    if (status) {
      query.status = status;
    }

    const requests = await PwDRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'name email location');

    res.json({
      success: true,
      count: requests.length,
      data: { requests },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm/Verify delivery of a request
 */
const confirmDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const request = await PwDRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    // Check if request belongs to user
    if (request.requestedBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to confirm this request',
      });
    }

    // Update status
    if (request.status === 'Delivered') {
      request.status = 'Verified';
      request.verifiedAt = new Date();

      // Update related support status
      await Support.updateMany(
        { requestId: id },
        { status: 'Completed', completedAt: new Date() }
      );

      // Create notification for donor
      const supports = await Support.find({ requestId: id }).populate('donorId');
      for (const support of supports) {
        if (support.donorId) {
          await Notification.create({
            userId: support.donorId._id,
            title: 'Request Verified',
            message: `Your supported request for ${request.aidName} has been verified by the beneficiary.`,
            type: 'Success',
          });
        }
      }
    } else if (request.status === 'Approved' || request.status === 'InProgress') {
      request.status = 'Delivered';
      request.deliveredAt = new Date();
    } else {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm request with status: ${request.status}`,
      });
    }

    await request.save();

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: { request },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload verification document
 */
const uploadDocument = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Update user with document info
    const user = await User.findByIdAndUpdate(
      userId,
      {
        verificationDoc: req.file.filename,
        verificationStatus: 'Pending',
        udidVerified: false,
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Create notification for admin
    const admins = await User.find({ role: 'Admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: 'New Verification Document',
        message: `${user.name} has uploaded a verification document.`,
        type: 'Info',
        link: `/admin/verifications`,
      });
    }

    // Create notification for user
    await Notification.create({
      userId: userId,
      title: 'Document Uploaded',
      message: 'Your verification document has been uploaded. Awaiting admin verification.',
      type: 'Success',
    });

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        user,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get notifications for current PwD user
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  confirmDelivery,
  uploadDocument,
  getMyNotifications,
};
