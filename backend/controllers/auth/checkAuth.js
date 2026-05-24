export const checkAuth = async (req, res) => {
    // req.user has already been resolved by our auth middleware
    res.status(200).json({
        isAuthenticated: true,
        user: { id: req.user._id, name: req.user.name, email: req.user.email }
    });
};
