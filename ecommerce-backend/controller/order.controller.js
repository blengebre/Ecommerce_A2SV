const Order = require("../model/order");
const Product = require("../model/product");
const mongoose = require("mongoose");

exports.placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id; // extracted from JWT middleware
    const orderItems = req.body; // [{ productId, quantity }, ...]

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Order must contain products." });
    }

    let totalPrice = 0;
    const productsForOrder = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw { status: 404, message: `Product not found: ${item.productId}` };
      }

      if (product.stock < item.quantity) {
        throw {
          status: 400,
          message: `Insufficient stock for ${product.name}`,
        };
      }

      // Update stock
      product.stock -= item.quantity;
      await product.save({ session });

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      productsForOrder.push({
        product: product._id,
        quantity: item.quantity,
      });
    }

    // Create order
    const newOrder = await Order.create(
      [
        {
          user: userId,
          products: productsForOrder,
          total_price: totalPrice,
          status: "pending",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Order placed successfully",
      order: newOrder[0],
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to place order" });
  }
};

exports.GetMyOrders = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const userId = req.user.id;

    // Fetch orders for this user only
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // Map to only include summary info
    const orderSummaries = orders.map(order => ({
      order_id: order._id,
      status: order.status,
      total_price: order.totalPrice, // adjust field name based on your model
      created_at: order.createdAt,
    }));

    res.status(200).json({
      message: 'Orders retrieved successfully',
      orders: orderSummaries,
    });
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.product").populate("user", "username email");

    res.status(200).json({
      message: "All orders retrieved successfully",
      orders,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Failed to retrieve all orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status." });
    }           
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    await order.save();
    
    res.status(200).json({

        message: "Order status updated successfully",   
        order,
    });
  }

    catch (error) {
    res
        .status(500)
        .json({ message: error.message || "Failed to update order status" });
    }   
};