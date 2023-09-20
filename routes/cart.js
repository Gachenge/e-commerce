const router = require('express').Router();
const Cart = require('../models/Cart');
const { verifyTokenAuth, verifyToken } = require('./verifyToken');

router.post("/add", verifyToken, async (req, res) => {
    const newCart = new Cart(req.body)
    try {
        const saved = await newCart.save()
        res.status(200).json(saved)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.put("/:id", verifyTokenAuth, async (req, res) => {
    try {
        const updatedCart = await Cart.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        },
        { new: true }
        );
        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(500).json( err.message );
    }
})

router.delete("/:id", verifyTokenAuth, async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id)
        res.status(200).json("Cart deleted")
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.get("/:userId", verifyTokenAuth, async(req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
        res.status(200).json(cart)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.get("/", verifyTokenAuth, async(req, res) => {
    try {
        const carts = await Cart.find()
        res.status(200).json(carts)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

module.exports = router
