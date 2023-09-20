const router = require('express').Router();
const Product = require('../models/Products');
const { verifyTokenAdmin } = require('./verifyToken');

router.post("/add", verifyTokenAdmin, async (req, res)=> {
    const newProduct = new Product(req.body)

    try {
        const saved = await newProduct.save();
        res.status(200).json(saved)
    }
    catch(err){
        res.status(500).json(err.message)
    }
})

router.put("/:id", verifyTokenAdmin, async (req, res)=> {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            },
            { new: true }
        );
    
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json( err.message );
    }
})

router.delete("/:id", verifyTokenAdmin, async(req, res)=> {
    try {
        await Product.findByIdAndDelete(req.params.id)
        res.status(200).json("Product deleted")
    }
    catch(err) {
        res.status(500).json(err.message)
    }
})

router.get("/:id", verifyTokenAdmin, async(req, res) => {
    try {
        const product = Product.findById(req.params.id)
        res.status(200).json(product)
    }
    catch(err) {
        res.status(500).json(err.message)
    }
})

router.get("/", verifyTokenAdmin, async(req, res) => {
    try {
        const products = await Product.find()
        res.status(200).json(products)
    }
    catch(err) {
        res.status(500).json(err.message)
    }
})



module.exports = router
