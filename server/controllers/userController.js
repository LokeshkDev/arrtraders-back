import User from '../models/sql/User.js';
import Product from '../models/sql/Product.js';
import generateToken from '../utils/generateToken.js';
import { admin, isFirebaseInitialized } from '../config/firebaseAdmin.js';

// Helper to format Mongo-like ID if needed for new users
const generateMongoId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

// Helper to format ID for responses and parse JSON fields
const parseJson = (val) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
    }
    return val;
};

const formatResponse = (data) => {
    if (!data) return null;
    const json = data.toJSON ? data.toJSON() : data;
    const formatted = { ...json, _id: json.id || json._id };
    if (formatted.addresses) formatted.addresses = parseJson(formatted.addresses);
    if (formatted.wishlist) formatted.wishlist = parseJson(formatted.wishlist);
    return formatted;
};

// @desc    Auth user with Google & get token
// @route   POST /api/users/google-login
export const googleLogin = async (req, res) => {
    try {
        if (!isFirebaseInitialized) {
            console.error('Google Login Error: Firebase Admin NOT initialized. Check FIREBASE_SERVICE_ACCOUNT_JSON.');
            return res.status(500).json({ 
                message: 'Authentication service configuration error.',
                debug: 'Firebase Admin not initialized'
            });
        }

        const { idToken } = req.body;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture } = decodedToken;

        let user = await User.findOne({ where: { email: email.toLowerCase() } });

        if (user) {
            // Restriction: Only customers can use social login (if user is admin, block them)
            if (user.isAdmin) {
                return res.status(401).json({ 
                    message: 'Admin accounts must use the standard login form for security.' 
                });
            }
        } else {
            // Create new customer user
            user = await User.create({
                id: generateMongoId(),
                name: name || 'Google User',
                email: email.toLowerCase(),
                password: Math.random().toString(36).slice(-16), // Dummy password for oauth users
                isAdmin: false,
                phone: ''
            });
        }

        const token = generateToken(user.id);
        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            addresses: user.addresses,
            token: token // Send token explicitly for header-based auth
        });
    } catch (error) {
        console.error('Google Login Backend Error:', error.message);
        res.status(401).json({ 
            message: 'Invalid Google token or verification failed',
            details: process.env.NODE_ENV === 'production' ? undefined : error.message 
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
export const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();
        const user = await User.findOne({ where: { email: normalizedEmail } });

        if (user && (await user.matchPassword(trimmedPassword))) {
            const token = generateToken(user.id);
            const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            const formattedUser = formatResponse(user);
            res.json({
                ...formattedUser,
                token: token // Explicit token for header-based auth
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/users
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, isAdmin } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ where: { email: normalizedEmail } });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const user = await User.create({
            id: generateMongoId(),
            name: name.trim(),
            email: normalizedEmail,
            password,
            phone: phone || '',
            isAdmin: isAdmin || false
        });

        if (user) {
            const token = generateToken(user.id);
            const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: user.isAdmin,
                addresses: user.addresses,
                token: token // Explicit token for header-based auth
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id || req.user._id);
        if (user) {
            // Manual population of wishlist
            const userData = user.toJSON();
            const wishlistIds = parseJson(userData.wishlist) || [];
            
            let wishlist = [];
            if (wishlistIds.length > 0) {
                wishlist = await Product.findAll({ where: { id: wishlistIds } });
            }

            const formattedUser = formatResponse(user);
            res.json({
                ...formattedUser,
                wishlist: wishlist.map(p => ({ ...p.toJSON(), _id: p.id }))
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (own)
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id || req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email ? req.body.email.trim().toLowerCase() : user.email;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            const token = generateToken(updatedUser.id);
            const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                isAdmin: updatedUser.isAdmin,
                addresses: updatedUser.addresses
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add address
// @route   POST /api/users/address
export const addAddress = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { label, name, phone, line1, line2, city, state, pincode, isDefault } = req.body;
        
        let addresses = [...(user.addresses || [])];

        if (isDefault) {
            addresses.forEach(a => a.isDefault = false);
        }
        if (addresses.length === 0) {
            req.body.isDefault = true;
        }

        const newAddress = { 
            _id: generateMongoId(), 
            label, name, phone, line1, line2, city, state, pincode, 
            isDefault: isDefault || addresses.length === 0 
        };

        addresses.push(newAddress);
        user.addresses = addresses;
        await user.save();
        res.status(201).json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update address
// @route   PUT /api/users/address/:addressId
export const updateAddress = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let addresses = [...(user.addresses || [])];
        const addressIdx = addresses.findIndex(a => a._id === req.params.addressId);
        
        if (addressIdx === -1) return res.status(404).json({ message: 'Address not found' });

        if (req.body.isDefault) {
            addresses.forEach(a => a.isDefault = false);
        }

        addresses[addressIdx] = { ...addresses[addressIdx], ...req.body };
        user.addresses = addresses;
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:addressId
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.addresses = (user.addresses || []).filter(a => a._id !== req.params.addressId);
        await user.save();
        res.json(user.addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id || req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { productId } = req.body;
        let wishlist = [...(user.wishlist || [])];
        const idx = wishlist.indexOf(productId);
        
        if (idx > -1) {
            wishlist.splice(idx, 1);
        } else {
            wishlist.push(productId);
        }
        
        user.wishlist = wishlist;
        await user.save();
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (admin)
// @route   GET /api/users
export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }
        });
        const formattedUsers = users.map(u => ({ ...u.toJSON(), _id: u.id }));
        res.json(formattedUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin update user
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email ? req.body.email.trim().toLowerCase() : user.email;
            user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
            user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                isAdmin: updatedUser.isAdmin,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin reset user password
// @route   PUT /api/users/:id/reset-password
export const resetUserPassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            user.password = req.body.password;
            await user.save();
            res.json({ message: 'Password reset successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (admin)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.destroy();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/users/stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const adminUsers = await User.count({ where: { isAdmin: true } });
        const customerUsers = totalUsers - adminUsers;
        const recentUsers = await User.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] }
        });
        const formattedRecent = recentUsers.map(u => ({ ...u.toJSON(), _id: u.id }));
        res.json({ totalUsers, adminUsers, customerUsers, recentUsers: formattedRecent });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
export const logoutUser = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
