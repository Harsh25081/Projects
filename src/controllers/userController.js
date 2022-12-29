const userModel = require("../models/userModel")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { isValidName, isValidEmail, isValidObjectId, isValidString, isValidBody, isValidPhone, isValidPassword, isValidPincode } = require('../validators/validations')
const { getImage } = require("./aws")

//================================// create user //====================================

const createUser = async function (req, res) {
    try {
        let data = req.body
        let { fname, lname, email, phone, password, address } = data
        if (!isValidBody(data))return res.status(400).send({ status: false, message: "Please provide data" })
        
        if (!fname||fname.trim()==0)return res.status(400).send({ status: false, message: "Please provide your First Name" })
        if (!isValidName(fname))return res.status(400).send({ status: false, message: "Please provide valid First Name" })
        if (!lname||lname.trim()==0)return res.status(400).send({ status: false, message: "Please provide Last name" })
        if (!isValidName(lname))return res.status(400).send({ status: false, message: "Please provide valid Last name" })
       
        if (!email||email.trim()==0)return res.status(400).send({ status: false, message: "Please provide Email" })
        if (!isValidEmail(email))return res.status(400).send({ status: false, message: "Please provide valid Email Id" })
        let emailExist = await userModel.findOne({ email: email })
        if (emailExist)return res.status(400).send({ status: false, msg: "Email ID is already registered" })
        
        if (!phone||phone.trim()==0)return res.status(400).send({ status: false, message: "Please provide Phone" })
        if (!isValidPhone(phone))return res.status(400).send({ status: false, message: "Please provide valid Indian Phone Number" })
        let phoneExist = await userModel.findOne({ phone: phone })
        if (phoneExist)return res.status(400).send({ status: false, msg: "Phone number is already registered" })
        
        if (!password)return res.status(400).send({ status: false, message: "Please provide Password" })
        if (password.length < 8 || password.length > 15) return res.status(400).send({ status: false, message: "Pls provide a password of length between 8 to 15" })
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Pls provide valid password of length 8-15 example(Ayush@123)" })
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)
        data.password = secPass
        
        if (!address)return res.status(400).send({ status: false, message: "Please provide Address" })
        try {
            address = JSON.parse(address)
            data.address = address
        } catch{
            return res.status(400).send({ status: false, message: "Address must be an Object-type" })
        }

        let { shipping, billing } = address
        if (!shipping)return res.status(400).send({ status: false, message: "Please provide Shipping Address" })
        if (typeof shipping != "object") return res.status(400).send({ status: false, message: "Shipping must be an Object-type" })
        if (shipping) {
            let { street, city, pincode } = shipping
            if (!street)return res.status(400).send({ status: false, message: "Please provide Street" })
            if (!isValidString(street))return res.status(400).send({ status: false, message: "Please provide valid Street Name" })
            if (!city)return res.status(400).send({ status: false, message: "Please provide City" })
            if (!isValidName(city))return res.status(400).send({ status: false, message: "Please provide valid City Name" })
            if (!pincode)return res.status(400).send({ status: false, message: "Please provide Pincode" })
            if (!isValidPincode(pincode))return res.status(400).send({ status: false, message: "Please provide valid Pincode" })
            data.address.shipping.pincode = Number(pincode)
        }
        if (typeof billing != "object") return res.status(400).send({ status: false, message: "Billing must be an Object-type" })
        if (billing) {
            let { street, city, pincode } = billing
            if (!street)return res.status(400).send({ status: false, message: "Please provide Street" })
            if (!isValidString(street))return res.status(400).send({ status: false, message: "Please provide valid Street Name" })
            if (!city)return res.status(400).send({ status: false, message: "Please provide City" })
            if (!isValidName(city))return res.status(400).send({ status: false, message: "Please provide valid City Name" })
            if (!pincode)return res.status(400).send({ status: false, message: "Please provide Pincode" })
            if (!isValidPincode(pincode))return res.status(400).send({ status: false, message: "Please provide valid Pincode" })
            data.address.billing.pincode = Number(pincode)
        }
        let files = req.files
        if (!files || files.length == 0)return res.status(400).send({ status: false, message: "Please provide Profile Image" })
        data.profileImage = await getImage(files)
        
        let saveDetails = await userModel.create(data)
        saveDetails = saveDetails.toObject()
        delete saveDetails.password
        
        return res.status(201).send({ status: true, message: "User Created Successfully", data: saveDetails })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//===============================// user login //===============================================

const userLogin = async (req, res) => {
    try {
        if(!isValidBody(req.body))return res.status(400).send({ status: false, message: "Please provide email and Password" })
        let { email, password } = req.body
        if (!email) { return res.status(400).send({ status: false, message: "Pls provide email" }) }
        if (!isValidEmail(email))return res.status(400).send({ status: false, message: "Please provide valid Email Id" })
       
        if (!password) { return res.status(400).send({ status: false, message: "Pls provide password" }) }
        let userDetails = await userModel.findOne({ email })
        if (!userDetails) { return res.status(404).send({ status: false, message: "This email Id is not Registered" }) }
        const hash = userDetails.password
        const finalPaswword = (result) => {
            if (result == true) {
                let token = jwt.sign(
                    {
                        userId: userDetails._id.toString(),
                    },
                    "project05", {

                    expiresIn: '24h'
                }
                );
                let userId = userDetails._id
                res.setHeader("x-auth-token", token);
                return res.status(200).send({ status: true, message: "User login successfull", data: { userId: userId, token: token } });
            }
            else {
                return res.status(401).send({ status: false, message: "incorrect Password" })
            }

        }
        await bcrypt.compare(password, hash, function (err, result) {
            finalPaswword(result)
        })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//==========================// get user details //========================================

const getUserProfile = async function (req, res) {
    try {
        const userId = req.params.userId
        // UserId Validation :-
        if (!userId)return res.status(400).send({ status: false, message: "Please provide userId" })
        if (!isValidObjectId(userId))return res.status(400).send({ status: false, message: "userId is INVALID" })

        const findUser = await userModel.findById(userId).select({password:0})
        if (!findUser)return res.status(404).send({ status: false, message: "No User exists with this userId" })
        res.status(200).send({ status: true, message: "User profile details", "data": findUser })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

//==========================// update user //==============================================

const UpdateUser = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "Please provide valid User Id " })
        const checkUser = await userModel.findById(userId)
        if (!checkUser) return res.status(404).send({ status: false, message: "User not found" })

        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: 'Provide atleast One field to Update' })
        let { email, phone, password, address } = data
        if (email) {if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "Pls provide a valid email" }) }
        if (phone) { if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "Pls provide a valid phone" }) }
        if (password) { 
            if (password.length < 8 || password.length > 15) return res.status(400).send({ status: false, message: "Pls provide a password of length between 8 to 15" })
            if (!isValidPassword(password))return res.status(400).send({ status: false, message: "Pls provide valid password of length 8-15 example(Ayush@123)" })
            const salt = await bcrypt.genSalt(10)
            const secPass = await bcrypt.hash(password, salt)
            data.password = secPass
        }
        if (address) {
            try{
                address = JSON.parse(address)
                data.address = address
            }catch{
                return res.status(400).send({ status: false, message: "Address must be an Object-type" })
            }
            let { shipping, billing } = address
            if (shipping) {
                if (typeof shipping != "object") return res.status(400).send({ status: false, message: "Shipping must be an Object-type" })
                let { pincode } = shipping
                if (pincode) {
                    if (!isValidPincode(pincode))return res.status(400).send({ status: false, message: "Please provide valid Pincode" })
                    data.address.shipping.pincode = Number(pincode)
                }
            }
            if (billing) {
                if (typeof billing != "object") return res.status(400).send({ status: false, message: "Billing must be an Object-type" })
                let { pincode } = billing
                if (pincode) {
                    if (!isValidPincode(pincode))return res.status(400).send({ status: false, message: "Please provide valid Pincode" })
                    data.address.billing.pincode = Number(pincode)
                }
            }
        }

        let files = req.files
        if (files.length != 0) {data.profileImage = await getImage(files)}

        let unique = await userModel.findOne({ $or: [{ email }, { phone }] })
        if (unique) {
            if (unique.email == email) return res.status(400).send({ status: false, message: "This emailId is already Registered" })
            else {return res.status(400).send({ status: false, message: "This Phone Number is already Registered" }) }
        }
        let UpdateUser = await userModel.findByIdAndUpdate(userId,
            { $set: data }, { new: true })
        return res.status(200).send({ status: true, message: "User profile updated", data: UpdateUser })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


module.exports = { createUser, userLogin, getUserProfile, UpdateUser }