import { ApiError } from "../util/ApiError.js";
import User from "../models/staff.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import transporter from "../middleware/nodeMailer.js";
// import crypto from "crypto"

// const secretKey = crypto.randomBytes(32).toString('hex');
// console.log(secretKey)



// Email validation function
const isValidEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    throw new ApiError(403, "Wrong email format");
  }
  return true;
};

// Render the registration page
const renderHomePage = async (req, res) => {
  try {
    return res.status(200).render("auth/register");
  } catch (error) {
    console.error("Error rendering registration page:", error);
    throw new ApiError(500, "Something went wrong while rendering the page");
  }
};


const isStrongPassword = (password) => {
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
if (!passwordPattern.test(password)) {
  throw new ApiError(400, "Password must be at least 8 characters long, and include an uppercase letter, a lowercase letter, a number, and a special character.");
}

return true;
}

// Handle staff registration
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
    } = req.body;

    console.log("Registeration body:", req.body)

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

    // If there are missing fields, send a response
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "The following fields are required:",
        missingFields,
      });
    }

    // Validate password strength
    isStrongPassword(password);

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(401, "Email is already registered");
    }

    // Validate email format
    isValidEmail(email);

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate phone number (must follow Nigerian format +234XXXXXXXXXX)
    const phonePattern = /^\+234\d{10}$/;
    if (!phonePattern.test(phoneNumber)) {
      throw new ApiError(401, "Invalid phone number format");
    }

    // Validate next of kin phone number (must follow Nigerian format +234XXXXXXXXXX)
    if (!phonePattern.test(nextOfKinPhoneNumber)) {
      throw new ApiError(401, "Invalid next of kin phone number format");
    }

    // Validate account number (must be exactly 10 digits)
    const accountPattern = /^\d{10}$/;
    if (!accountPattern.test(accountNumber)) {
      throw new ApiError(401, "Account number must be exactly 10 digits");
    }

    // Create a new user
    const newUser = new User({
      fullname,
      email,
      address,
      nextOfKin,
      password: hashedPassword,
      phoneNumber,
      nextOfKinPhoneNumber,
      accountNumber,
      accountName,
    });

    // Save the user to the database
    await newUser.save();

    // Respond with success
    return res.status(201).render("auth/login");
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(error.status || 500).json({ message: error.message || "An error occurred during registration" });
  }
};


const loginPage = async (req, res) => {
  try {
    // Render the login page
    return res.status(200).render("auth/login");
  } catch (err) {
    console.error("Error rendering login page:", err);
    // Handle rendering errors
    throw new ApiError(500, "An error occurred while loading the login page");
  }
};

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
      expiresIn: '1h', 
    });

    res.cookie("token", token, {
      httpOnly: true, 
      maxAge: 3600000, 
    });

    return res.status(200).render("auth/profile");
  } catch (error) {
    console.error("Error during login:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).render("auth/login", { error: error.message });
    }

    // Handle unexpected errors
    throw new ApiError(500, "An unexpected error occurred during login");
  }
};

export { renderHomePage, staffRegisterPage, loginPage, login };
