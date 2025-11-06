import express from "express";
import {
  createAuditLog,
  getAuditLogs,
  getAuditStats,
  getAuditLogById,
  deleteAuditLogs,
  exportAuditLogs,
} from "../../controllers/api/auditController.js";

const router = express.Router();

// Get all audit logs with filtering and pagination
router.get("/", getAuditLogs);

// Get audit statistics
router.get("/stats", getAuditStats);

// Export audit logs
router.get("/export", exportAuditLogs);

// Get single audit log by ID
router.get("/:id", getAuditLogById);

// Create audit log
router.post("/", createAuditLog);

// Bulk delete audit logs (soft delete)
router.delete("/bulk", deleteAuditLogs);

export default router;
