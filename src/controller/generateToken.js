import crypto from "crypto";

const  generateResentToken = () => {
    // Generate a random reset token
console.log   (crypto.randomBytes(20).toString("hex"))
}


export default generateResentToken