import Ticket from '../models/Ticket.js';
import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';
import { determineDepartment } from '../services/routingService.js';
import { determineWard } from '../services/wardService.js';
import { verifyResolution } from '../services/aiVisionService.js';
import { saveImageFile } from '../services/storageService.js';

export async function createTicket(req, res) {
  try {
    const {
      issueType,
      description,
      voiceTranscription,
      latitude,
      longitude,
      aiConfidence,
      severity,
      citizenId,
      image,
    } = req.body;

    if (!issueType) {
      return res.status(400).json({ success: false, message: 'Issue type is required' });
    }

    // 1. Process and save image
    let imageUrl = req.body.imageUrl || '';
    let imageName = req.body.imageName || 'evidence.jpg';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      imageName = req.file.originalname;
    } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
      imageName = req.body.imageName || image?.name || 'evidence.jpg';
    } else if (image?.previewUrl) {
      imageUrl = await saveImageFile(image.previewUrl, image.name);
      imageName = image.name || 'evidence.jpg';
    }

    // 2. Determine department routing
    const departmentRouting = await determineDepartment(issueType);

    // 3. Determine municipal ward routing from GPS coordinates
    const wardRouting = await determineWard(
      latitude != null ? Number(latitude) : null,
      longitude != null ? Number(longitude) : null
    );

    // 4. Generate unique Ticket ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const ticketId = `CIV-2026-${randomSuffix}`;

    const parsedConfidence =
      aiConfidence !== undefined && aiConfidence !== null
        ? Number(Number(aiConfidence).toFixed(2))
        : 0;

    // Strictly bind citizenId to authenticated user ID
    const actualCitizenId = req.user ? String(req.user._id) : 'citizen_guest';

    console.log(`[Create Ticket] ${ticketId} created by citizenId: ${actualCitizenId} (${req.user?.email || 'guest'})`);

    const newTicket = await Ticket.create({
      ticketId,
      citizenId: actualCitizenId,
      imageUrl,
      imageName,
      issueType,
      description: description || '',
      voiceTranscription: voiceTranscription || '',
      aiConfidence: parsedConfidence,
      confidence: parsedConfidence,
      severity: severity || 'Medium',
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      departmentId: departmentRouting.departmentId,
      department: departmentRouting.departmentName,
      departmentName: departmentRouting.departmentName,
      wardId: wardRouting.wardId,
      ward: wardRouting.wardName,
      wardName: wardRouting.wardName,
      assignedWorkerId: null,
      assignedWorkerName: null,
      assignedWorkerPhone: null,
      status: 'Reported',
    });

    // Create in-app Notification for citizen
    if (actualCitizenId && actualCitizenId !== 'citizen_guest') {
      await Notification.create({
        userId: actualCitizenId,
        ticketId: newTicket.ticketId,
        title: 'Report Received & Routed',
        message: `Your report ${ticketId} has been received and routed to ${departmentRouting.departmentName}.`,
        type: 'info',
      });
    }

    return res.status(201).json({
      success: true,
      data: newTicket,
    });
  } catch (err) {
    console.error('Create ticket error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getTickets(req, res) {
  try {
    const { status, departmentId, wardId, search } = req.query;
    const filter = {};

    // Role-based data access enforcement
    if (req.user) {
      if (req.user.role === 'citizen') {
        // Citizens ONLY see their own submitted reports
        filter.citizenId = String(req.user._id);
      } else if (req.user.role === 'worker') {
        // Workers ONLY see tasks assigned directly to them
        const workerId = req.user.workerId || String(req.user._id);
        filter.$or = [
          { assignedWorkerId: String(req.user._id) },
          { assignedWorkerId: workerId },
        ];
      } else if (req.user.role === 'authority') {
        // Authority sees tickets for their department (or all if general authority)
        if (req.user.departmentId && req.user.departmentId !== 'all') {
          filter.departmentId = req.user.departmentId;
        } else if (departmentId) {
          filter.departmentId = departmentId;
        }
      }
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (wardId && wardId !== 'All') {
      filter.wardId = wardId;
    }

    const tickets = await Ticket.find(filter);
    let ticketList = Array.isArray(tickets) ? tickets : [];

    // Always return newest first
    ticketList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      ticketList = ticketList.filter(
        (t) =>
          t.ticketId?.toLowerCase().includes(q) ||
          t.issueType?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.wardName?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: ticketList.length,
      data: ticketList,
    });
  } catch (err) {
    console.error('Get tickets error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMyTickets(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const filter = { citizenId: String(req.user._id) };
    const tickets = await Ticket.find(filter);
    let ticketList = Array.isArray(tickets) ? tickets : [];

    // Always sort newest first
    ticketList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      success: true,
      count: ticketList.length,
      data: ticketList,
    });
  } catch (err) {
    console.error('Get my tickets error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getTicketById(req, res) {
  try {
    const { id } = req.params;
    let ticket = await Ticket.findById(id);

    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role-based authorization check
    if (req.user) {
      if (req.user.role === 'citizen') {
        const userCitizenId = String(req.user._id);
        if (ticket.citizenId && ticket.citizenId !== userCitizenId && ticket.citizenId !== 'citizen_guest') {
          return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this report',
          });
        }
      } else if (req.user.role === 'worker') {
        const workerId = req.user.workerId || String(req.user._id);
        const isAssigned = ticket.assignedWorkerId === String(req.user._id) || ticket.assignedWorkerId === workerId;
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: 'You can only view tasks assigned to you',
          });
        }
      } else if (req.user.role === 'authority') {
        if (req.user.departmentId && req.user.departmentId !== 'all' && ticket.departmentId && ticket.departmentId !== req.user.departmentId) {
          // Department mismatch
          return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: `This report belongs to ${ticket.departmentName || ticket.departmentId}, not your department.`,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;

    let ticket = await Ticket.findById(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only Authority can delete tasks
    if (req.user?.role !== 'authority') {
      return res.status(403).json({ success: false, message: 'Only municipal authority can delete tickets' });
    }

    if (req.user.departmentId && req.user.departmentId !== 'all' && ticket.departmentId && ticket.departmentId !== req.user.departmentId) {
      return res.status(403).json({ success: false, message: 'You can only remove tasks in your own department' });
    }

    await Ticket.findByIdAndDelete(ticket._id || id);

    // Remove associated notifications
    await Notification.deleteMany({ ticketId: ticket.ticketId });

    return res.status(200).json({
      success: true,
      message: `Ticket ${ticket.ticketId} has been permanently removed from the system`,
    });
  } catch (err) {
    console.error('Delete ticket error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function assignWorker(req, res) {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({ success: false, message: 'Worker ID is required' });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    let ticket = await Ticket.findById(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const assignedWorkerId = worker.workerId || String(worker.userId || worker._id);

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        assignedWorkerId,
        assignedWorkerName: worker.name,
        assignedWorkerPhone: worker.phone,
        status: 'Assigned',
      },
      { new: true }
    );

    // Update worker status
    await Worker.findByIdAndUpdate(worker._id, { availabilityStatus: 'Assigned' });

    // Notify citizen
    if (ticket.citizenId && ticket.citizenId !== 'citizen_guest') {
      await Notification.create({
        userId: ticket.citizenId,
        ticketId: ticket.ticketId,
        title: 'Municipal Worker Dispatched',
        message: `Field technician ${worker.name} has been assigned to your report ${ticket.ticketId}.`,
        type: 'assigned',
      });
    }

    // Notify worker
    if (worker.userId) {
      await Notification.create({
        userId: String(worker.userId),
        ticketId: ticket.ticketId,
        title: 'New Work Order Assigned',
        message: `You have been assigned to civic order ${ticket.ticketId}: ${ticket.issueType} at ${ticket.wardName || 'assigned site'}.`,
        type: 'assigned',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Task ${ticket.ticketId} assigned to ${worker.name}`,
      data: updatedTicket,
    });
  } catch (err) {
    console.error('Assign worker error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function startTask(req, res) {
  try {
    const { id } = req.params;

    let ticket = await Ticket.findById(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Verify worker assignment
    const currentWorkerId = req.user?.workerId || String(req.user?._id);
    const isAssigned =
      ticket.assignedWorkerId === String(req.user?._id) ||
      ticket.assignedWorkerId === currentWorkerId ||
      req.user?.role === 'authority';

    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You can only start tasks assigned to you' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        status: 'In Progress',
        startedAt: new Date(),
      },
      { new: true }
    );

    // Notify citizen
    if (ticket.citizenId && ticket.citizenId !== 'citizen_guest') {
      await Notification.create({
        userId: ticket.citizenId,
        ticketId: ticket.ticketId,
        title: 'Work In Progress',
        message: `Technician ${ticket.assignedWorkerName || req.user.name} has commenced repair work on your report ${ticket.ticketId}.`,
        type: 'in_progress',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task is now in progress',
      data: updatedTicket,
    });
  } catch (err) {
    console.error('Start task error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function submitResolution(req, res) {
  try {
    const { id } = req.params;
    const { resolutionNote, resolutionPhoto } = req.body;

    let ticket = await Ticket.findById(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Process resolution photo
    let resolutionImageUrl = '';
    let resolutionImageName = 'completion_proof.jpg';

    if (req.file) {
      resolutionImageUrl = `/uploads/${req.file.filename}`;
      resolutionImageName = req.file.originalname;
    } else if (resolutionPhoto?.previewUrl) {
      resolutionImageUrl = await saveImageFile(resolutionPhoto.previewUrl, resolutionPhoto.name);
      resolutionImageName = resolutionPhoto.name || 'completion_proof.jpg';
    } else if (typeof resolutionPhoto === 'string' && resolutionPhoto.startsWith('/uploads/')) {
      resolutionImageUrl = resolutionPhoto;
    }

    if (!resolutionImageUrl) {
      return res.status(400).json({ success: false, message: 'Work completion photo is required' });
    }

    // AI verification comparing before and after
    let verification = null;
    try {
      verification = await verifyResolution(
        ticket.imageUrl,
        resolutionImageUrl,
        ticket.issueType
      );
    } catch (vErr) {
      console.warn('Resolution AI verification note:', vErr.message);
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        resolutionImageUrl,
        resolutionImageName,
        resolutionNote: resolutionNote || 'Work completed on site.',
        verification: verification || {
          verificationStatus: 'Completed',
          confidence: 0.9,
          reason: 'Worker submitted photo proof of completed repair.',
        },
        completedBy: req.user?.name || ticket.assignedWorkerName || 'Field Technician',
        completedAt: new Date(),
        status: 'Pending Verification',
      },
      { new: true }
    );

    // Notify citizen
    if (ticket.citizenId && ticket.citizenId !== 'citizen_guest') {
      await Notification.create({
        userId: ticket.citizenId,
        ticketId: ticket.ticketId,
        title: 'Resolution Submitted for Verification',
        message: `Field technician has submitted completion proof for report ${ticket.ticketId}. Awaiting final municipal authority audit.`,
        type: 'verification',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Work finished and submitted for authority verification',
      data: updatedTicket,
    });
  } catch (err) {
    console.error('Submit resolution error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function approveResolution(req, res) {
  try {
    const { id } = req.params;
    const { authorityNotes } = req.body;

    let ticket = await Ticket.findById(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        status: 'Resolved',
        resolvedAt: new Date(),
        resolvedBy: req.user?.name || 'Municipal Authority Official',
        authorityNotes: authorityNotes || '',
      },
      { new: true }
    );

    // Free worker
    if (ticket.assignedWorkerId) {
      await Worker.findByIdAndUpdate(ticket.assignedWorkerId, {
        availabilityStatus: 'Available',
      });
    }

    // Notify citizen
    if (ticket.citizenId && ticket.citizenId !== 'citizen_guest') {
      await Notification.create({
        userId: ticket.citizenId,
        ticketId: ticket.ticketId,
        title: 'Issue Resolved Successfully',
        message: `Your report #${ticket.ticketId} (${ticket.issueType}) has been verified and resolved by the ${ticket.departmentName || ticket.department || 'Municipal Authority'}.`,
        type: 'resolved',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report ${ticket.ticketId} marked as RESOLVED`,
      data: updatedTicket,
    });
  } catch (err) {
    console.error('Approve resolution error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function requestRework(req, res) {
  try {
    const { id } = req.params;
    const { reworkInstructions } = req.body;

    let ticket = await Ticket.findById(id);
    if (!ticket) {
      ticket = await Ticket.findOne({ ticketId: id });
    }
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticket._id,
      {
        status: 'Rework Required',
        reworkInstructions: reworkInstructions || 'Additional repair work required to satisfy municipal standards.',
      },
      { new: true }
    );

    // Notify worker
    if (ticket.assignedWorkerId) {
      await Notification.create({
        userId: ticket.assignedWorkerId,
        ticketId: ticket.ticketId,
        title: 'Rework Required on Task',
        message: `Authority requested additional work on order ${ticket.ticketId}: "${reworkInstructions || 'Please reinspect and finish repairs.'}"`,
        type: 'rework',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Report ${ticket.ticketId} marked for Rework`,
      data: updatedTicket,
    });
  } catch (err) {
    console.error('Request rework error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, reworkInstructions, authorityNotes, resolvedBy } = req.body;

    const updateFields = { status };
    if (reworkInstructions) updateFields.reworkInstructions = reworkInstructions;
    if (authorityNotes) updateFields.authorityNotes = authorityNotes;

    if (status === 'In Progress') {
      updateFields.startedAt = new Date();
    } else if (status === 'Resolved') {
      updateFields.resolvedAt = new Date();
      updateFields.resolvedBy = resolvedBy || req.user?.name || 'Municipal Authority Official';
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updatedTicket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status === 'Resolved' && updatedTicket.assignedWorkerId) {
      await Worker.findByIdAndUpdate(updatedTicket.assignedWorkerId, {
        availabilityStatus: 'Available',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedTicket,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
