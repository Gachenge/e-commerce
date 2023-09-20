const router = require('express').Router();
const Order = require('../models/Order');
const { verifyTokenAuth, verifyTokenAdmin } = require('./verifyToken');

router.post("/add", verifyTokenAuth, async (req, res) => {
    const newOrder = new Order(req.body)
    try {
        const saved = await newOrder.save()
        res.status(200).json(saved)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.put("/:id", verifyTokenAdmin, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        },
        { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(500).json( err.message );
    }
})

router.delete("/:id", verifyTokenAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id)
        res.status(200).json("Order deleted")
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.get("/:userId", verifyTokenAuth, async(req, res) => {
    try {
        const order = await Order.find({ userId: req.params.userId })
        res.status(200).json(order)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.get("/", verifyTokenAdmin, async(req, res) => {
    try {
        const orders = await Order.find()
        res.status(200).json(orders)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

module.exports = router
