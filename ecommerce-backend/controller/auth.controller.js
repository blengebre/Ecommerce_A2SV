
const user = require('../model/user.model');
const jwt = require('jsonwebtoken');

  const Product = require('../model/product');
require('dotenv').config();
// Secret key for JWT (store this in environment variables for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_EXPIRES_IN = '1h'; // Token expiration

// Regular Expressions
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// User Registration
const Signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: 'Username must be alphanumeric (letters and numbers only)',
      });
    }

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters long and include at least one uppercase, one lowercase, one number, and one special character (!@#$%^&*)',
      });
    }

    const existingEmail = await user.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const existingUsername = await user.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const newUser = new user({ username, email, password });
    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// User Login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(existingUser);

    res.status(200).json({
      message: 'Login successful',
      user: existingUser,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const validateProduct = (data) => {
  const { name, description, price, stock, category } = data;
  if (!name || name.length < 3 || name.length > 100)
    return 'Name must be between 3 and 100 characters.';
  if (!description || description.length < 10)
    return 'Description must be at least 10 characters long.';
  if (typeof price !== 'number' || price <= 0)
    return 'Price must be a positive number.';
  if (!Number.isInteger(stock) || stock < 0)
    return 'Stock must be a non-negative integer.';
  if (!category || category.trim() === '')
    return 'Category is required.';
  return null;
};
const UpdateProduct=async(req,res)=>{
  const {name, description, price, stock, category}=req.body;
  const error=validateProduct(req.body);
  if(error) return res.status(400).json({message:error});
  const Product = require('../model/product');
  try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });            
      if (!product) { 
          return res.status(404).json({ message: 'Product not found' });      
      }
      res.status(200).json({ message: 'Product updated successfully', product });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ message: 'Internal server error' });
    }



}

// Get all products
const GetAllProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    if(products.length<=10){
       res.status(200).json({
       message: 'Products retrieved successfully',
         products,
         totalProducts: products.length
    });
    }
    else{
      res.status(404).json({message:'Products not found'})
    }
  } catch (err) {
    console.error('Error retrieving products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// GET /products?search=productName&page=1&pageSize=10
const SearchProducts = async (req, res) => {
  try {
    const search = req.query.search || ''; // default empty search
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Filter: case-insensitive partial match if search provided
    const filter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    // Get total products matching the search
    const totalProducts = await Product.countDocuments(filter);

    // Calculate pagination
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Fetch paginated products
    const products = await Product.find(filter)
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      message: 'Products retrieved successfully',
      currentPage: page,
      pageSize,
      totalPages,
      totalProducts,
      products,
    });
  } catch (err) {
    console.error('Error searching products:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const GetDetail = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product retrieved successfully',
      product,
    });
  } catch (err) {
    console.error('Error retrieving product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const DeleteProduct=async(req,res)=>{
   const productId = req.params.id;
   
  try {
    const product = await Product.findByIdAndDelete(productId); 
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json({
      message: 'Product deleted successfully',
    });
  }
    catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Internal server error' });
  } 
}

module.exports = { Signup, Login: login , validateProduct,UpdateProduct,GetAllProduct,SearchProducts,GetDetail,DeleteProduct};
