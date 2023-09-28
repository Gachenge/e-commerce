const router = require('express').Router();
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { check, validationResult } = require('express-validator');

// Validation middleware for user registration input
const validateRegistration = [
  check('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
  check('email').isEmail().withMessage('Invalid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

router.post("/register", validateRegistration, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
        // Check if a user with the same username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Check if a user with the same email exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before storing it

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        if (savedUser._doc && savedUser._doc.password) {
            const { password, ...others } = savedUser._doc;
            res.status(201).json({ message: "Registration successful", user: others });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


const validateLogin = [
    check('username').notEmpty().withMessage('Username is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ];

  router.post("/login", async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Wrong username" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Generate an access token
            const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin
            },
            process.env.SECRET,
            { expiresIn: "3d" }
            );

            // Return the access token in the response
            res.status(200).json({
                message: "Login successful",
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                },
                accessToken
            });
         } else {
            res.status(401).json({ message: "Wrong username or password "})
         }
    } catch (err) {
        // Handle other errors
        res.status(500).json({ error: err.message });
    }
});


router.delete('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send("Unable to log out");
            } else {
                res.status(200).send('Logout successful');
            }
        });
    } else {
        res.end("You are not logged in");
    }
});



module.exports = router
