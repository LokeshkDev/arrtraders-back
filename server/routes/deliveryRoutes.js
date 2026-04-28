import express from 'express';
import { 
    validateLocation, getServiceableAreas, getZones, createZone, 
    updateZone, deleteZone, bulkUploadPincodes, checkPincode 
} from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/validate', validateLocation);
router.get('/areas', getServiceableAreas);
router.get('/check-pincode/:pincode', checkPincode);

// Admin routes
router.get('/zones', protect, admin, getZones);
router.post('/zones', protect, admin, createZone);
router.put('/zones/:id', protect, admin, updateZone);
router.delete('/zones/:id', protect, admin, deleteZone);
router.post('/zones/bulk', protect, admin, bulkUploadPincodes);

export default router;
