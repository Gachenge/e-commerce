const router = require('express').Router();
const User = require("../models/User")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")

router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.SECRET).toString()
    })

    try {
        const saved = await newUser.save();
        const { password, ...others } = saved._doc
        res.status(201).json(others)
    }
    catch (err) {
        res.status(500).json(err.message);
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });

        if (!user) {
            return res.status(401).json({ error: "Wrong username" });
        }

        const hashedP = CryptoJS.AES.decrypt(user.password, process.env.SECRET);
        const passw = hashedP.toString(CryptoJS.enc.Utf8);

        if (passw !== req.body.password) {
            return res.status(401).json({ error: "Wrong password" });
        }

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        },
        process.env.SECRET,
        {expiresIn: "3d"}
        )

        const { password, ...others } = user._doc;
        res.status(200).json({...others, accessToken})

    } catch (err) {
        // Handle other errors
        res.status(500).json({ error: err.message });
    }
});

router.delete('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                res.status(400).send("Unable to log out")
            } else {
                res.send('Logout successful')
            }
        })
    } else {
        req.end()
    }
})


module.exports = router
