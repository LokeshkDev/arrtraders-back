import express from 'express';
import { 
    authUser, 
    googleLogin,
    registerUser, 
    getUserProfile,
    updateUserProfile,
    getUsers, 
    updateUser,
    resetUserPassword,
    deleteUser,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getDashboardStats,
    logoutUser,
    phoneLogin
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authUser);
router.post('/google-login', googleLogin);
router.post('/phone-login', phoneLogin);
router.post('/register', registerUser);
router.post('/logout', logoutUser);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/address')
    .post(protect, addAddress);
router.route('/address/:addressId')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.route('/wishlist')
    .post(protect, toggleWishlist);

// Admin Routes
router.route('/')
    .get(protect, admin, getUsers);
router.get('/stats', protect, admin, getDashboardStats);
router.route('/:id')
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);
router.put('/:id/reset-password', protect, admin, resetUserPassword);

export default router;
