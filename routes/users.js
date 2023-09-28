const { verifyTokenAuth, verifyTokenAdmin } = require('./verifyToken');
const User = require('../models/User')
const bcrypt = require("bcrypt")
const { check, validationResult } = require('express-validator');


const router = require('express').Router();


router.put("/:id", verifyTokenAuth, async(req, res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (req.body.password){
        req.body.password = await bcrypt.hash(password, 10);
    }
    try {
    
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            },
            { new: true }
        );
    
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password, ...others } = updatedUser._doc
        res.status(200).json(others);
    } catch (err) {
        res.status(500).json( err.message );
    }
    
})

router.delete("/:id", verifyTokenAuth, async(req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).send("User has been deleted")
    }catch(err){
        res.status(500).json(err.message);
    }
})

router.get("/:id", verifyTokenAdmin, async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const { password, ...others } = user._doc;
        res.status(200).json(others)
    }catch(err){
        res.status(500).json(err.message);
    }
})

router.get("/", verifyTokenAdmin, async(req, res) => {
    try {
        const users = await User.find()
        const sanitised = users.map(user => {
            const { password, ...others } = user._doc;
            return others;
        })
        res.status(200).json(sanitised)
    }catch(err){
        console.error(err)
        res.status(500).json(err.message);
    }
})


module.exports = router
