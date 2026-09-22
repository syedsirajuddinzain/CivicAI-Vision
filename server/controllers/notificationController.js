import Notification from '../models/Notification.js';

export async function getNotifications(req, res) {
  try {
    const filter = {};
    if (req.user) {
      const uId = String(req.user._id);
      const workerId = req.user.workerId;
      filter.$or = [{ userId: uId }, { userId: 'all' }];
      if (workerId) {
        filter.$or.push({ userId: workerId });
      }
    } else if (req.query.userId) {
      filter.userId = req.query.userId;
    }

    const notifications = await Notification.find(filter);
    const notifList = Array.isArray(notifications) ? notifications : [];

    return res.status(200).json({
      success: true,
      count: notifList.length,
      unreadCount: notifList.filter((n) => !n.read).length,
      data: notifList,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markAllAsRead(req, res) {
  try {
    const filter = {};
    if (req.user) {
      filter.userId = String(req.user._id);
    } else if (req.body.userId) {
      filter.userId = req.body.userId;
    }

    await Notification.updateMany(filter, { read: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
