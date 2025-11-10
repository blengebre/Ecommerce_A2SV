const express=require('express');
const router=express.Router();
const Product = require('../model/product');
const { validateProduct } = require('../controller/auth.controller');
const {Signup,Login,UpdateProduct,GetAllProduct,SearchProducts,GetDetail,DeleteProduct}=require('../controller/auth.controller');
const {verifyToken,verifyAdmin,verifyUser}=require('../middleware/auth');
// User Registration Route
router.post('/auth/register',Signup);
router.post('/auth/login',Login);
router.post('/product', verifyToken, verifyAdmin, async (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
router.put('/product/:id', verifyToken, verifyAdmin, UpdateProduct)
router.get('/products', GetAllProduct)
router.get('/products/search',SearchProducts)
router.get('/products/:id',GetDetail);
router.delete('/products/:id',verifyToken,verifyAdmin,DeleteProduct);
const { placeOrder,GetMyOrders } = require("../controller/order.controller");


// POST /orders
router.post("/orders", verifyToken, verifyUser, placeOrder);
router.get('/orders', verifyToken, GetMyOrders);
module.exports = router;