import { ApiError } from "../util/ApiError.js";
import User from "../models/staff.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../controller/nodeMailerController.js";
import upload from "./multer.js";






// Validates email format
const isValidEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    throw new ApiError(403, "Wrong email format");
  }
  return true;
};

// Validates strong password
const isStrongPassword = (password) => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordPattern.test(password)) {
    throw new ApiError(
      400,
      "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character."
    );
  }
  return true;
};

// Sends a welcome email
const sendWelcomeEmail = async (email, fullname) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to De Bridge Hotel",
    html: `<h1>Welcome, ${fullname}!</h1><p>Thank you for joining us. We're excited to have you on board.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new ApiError(500, "Failed to send welcome email");
  }
};

// Page Render Functions

// Renders the home page (registration page)
const renderHomePage = async (req, res) => {
  try {
    return res.status(200).render("auth/register");
  } catch (error) {
    console.error("Error rendering registration page:", error);
    throw new ApiError(500, "Something went wrong while rendering the page");
  }
};

// Renders the login page
const loginPage = async (req, res) => {
  try {
    return res.status(200).render("auth/login");
  } catch (error) {
    console.error("Error rendering login page:", error);
    throw new ApiError(500, "An error occurred while loading the login page");
  }
};

// Renders forgot password page
const forgot = async (req, res) => {
  return res.status(200).render("auth/forgotPassword");
};

// Renders reset password page
const reset = async (req, res) => {
  const { token } = req.params;
  return res.status(200).render("auth/resetPassword", { token });
};



// Controller to handle file upload
const uploadFile = (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // File uploaded successfully
    res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  });
};

// Registration Function

const staffRegisterPage = async (req, res) => {
  try {
    const {
      fullname,
      email,
      address,
      nextOfKin,
      password,
      phoneNumber,
      accountNumber,
      accountName,
      nextOfKinPhoneNumber,
      imagePath
      
    } = req.body;
    

    

    // Validate required fields
    const missingFields = [];
    if (!fullname) missingFields.push("fullname");
    if (!email) missingFields.push("email");
    if (!address) missingFields.push("address");
    if (!nextOfKin) missingFields.push("nextOfKin");
    if (!password) missingFields.push("password");
    if (!phoneNumber) missingFields.push("phoneNumber");
    if (!accountNumber) missingFields.push("accountNumber");
    if (!accountName) missingFields.push("accountName");
    if (!nextOfKinPhoneNumber) missingFields.push("nextOfKinPhoneNumber");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "The following fields are required:",
        missingFields,
      });
    }

    // Validate email and password
    isStrongPassword(password);
    isValidEmail(email);

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(401, "Email is already registered");
    }

    // Validate phone numbers and account number
    const phonePattern = /^\+234\d{10}$/;
    if (!phonePattern.test(phoneNumber)) {
      throw new ApiError(401, "Invalid phone number format");
    }
    if (!phonePattern.test(nextOfKinPhoneNumber)) {
      throw new ApiError(401, "Invalid next of kin phone number format");
    }
    const accountPattern = /^\d{10}$/;
    if (!accountPattern.test(accountNumber)) {
      throw new ApiError(401, "Account number must be exactly 10 digits");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = new User({
      fullname,
      email,
      address,
      nextOfKin,
      password: hashedPassword,
      phoneNumber,
      nextOfKinPhoneNumber,
      accountNumber,
      accountName,
      imagePath: req.file ? req.file.filename : ""
    });

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(email, fullname);

    // Redirect to login page
    return res.status(201).render("auth/login");
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "An error occurred during registration" });
  }
};

// Login Function

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "Email not found!");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Incorrect password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 3600000,
    });

    return res.status(200).render("auth/profile", { user });
  } catch (error) {
    console.error("Error during login:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).render("auth/login", { error: error.message });
    }

    throw new ApiError(500, "An unexpected error occurred during login");
  }
};

// Forgot/Reset Password Functions

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetUrl = `http://localhost:5000/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Error sending email" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).render("auth/login");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token expired" });
    }
    res.status(400).json({ message: "Invalid or expired token", error: err.message });
  }
};

const renderUpdatePage = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Check if the user was found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    // Render the update page with the user's current data
    return res.status(200).render("auth/updateUser", { user });
  } catch (error) {
    console.error("Error rendering update page:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



const updateUser = async (req, res) => {
  try {
    // Extract email from route parameters
    const { email } = req.params;

    // Validate that email is provided
    if (!email) {
      return res.status(400).json({ message: "Email parameter is required to update user" });
    }

    // Extract fields to update from the request body
    const {
      fullname,
      phoneNumber,
      address,
      accountName,
      accountNumber,
      nextOfKin,
      nextOfKinPhoneNumber,
    } = req.body;

    // Prepare the data to update
    const updateData = {
      fullname,
      phoneNumber,
      address,
      accountName,
      accountNumber,
      nextOfKin,
      nextOfKinPhoneNumber,
    };

    // Log the data for debugging
    console.log("Update data:", updateData);
    
    // Update the user data in the database using email
    const updatedUser = await User.findOneAndUpdate(
      { email },              
      { $set: updateData },    
      { new: true }            
    );

    // Check if the user was not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the updated user
    return res.status(200).render("auth/profile", { user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Controller for rendering the delete confirmation page
const delete2 = async (req, res) => {
  try {
    const { email } = req.params; // Get email from the URL

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('auth/delete-user', { user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


const delete1 = async (req, res) => {
  try {
    const { email } = req.params; 

    const result = await User.deleteOne({ email });

    if (result.deletedCount === 1) {
      return res.status(200).render("auth/accountDeleted"); 
    } else {
      res.status(404).send('No user found with that email');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
















// Export Functions
export {
  renderHomePage,
  staffRegisterPage,
  loginPage,
  login,
  forgot,
  reset,
  forgotPassword,
  resetPassword,
  updateUser,
  renderUpdatePage,
  delete2,
  delete1,
  uploadFile
};
