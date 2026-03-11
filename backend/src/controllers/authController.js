import AdminUser from '../models/AdminUser.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
export const authAdmin = async (req, res) => {
    const { email, password } = req.body;

    const user = await AdminUser.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.json({
            _id: user._id,
            email: user.email,
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutAdmin = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Check auth status
// @route   GET /api/auth/check
// @access  Private
export const checkAuth = async (req, res) => {
    const user = await AdminUser.findById(req.user._id).select('-password');
    if (user) {
        res.json({ _id: user._id, email: user.email });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
