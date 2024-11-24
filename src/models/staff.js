import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: true, 
    },
    phoneNumber: {
        type: String,
        required: true, 
    },
    nextOfKin: {
        type: String,
        required: true,
    },
    nextOfKinPhoneNumber: {
        type: String,
        required: true, 
    },
    accountNumber: {
        type: String,
    },
    accountName: {
        type: String,
    },
    password: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const User = mongoose.model('User', userSchema);

export default User;
