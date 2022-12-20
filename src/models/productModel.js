const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({

    title: {type: String,required: true,unique: true},
    description: {type: String,required: true},
    price: {type:Number,required: true},
    currencyId: {type: String,required: true,enum : ["INR"]},
    currencyFormat: {type: String,required: true,enum : ['₹']},
    isFreeShipping: {type: Boolean,default: false},
    productImage: {type: String,required: true},  // s3 link
    style:String,
    availableSizes: {
        type: [String],
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },
    installments: Number,
    deletedAt: {type: Date,default: null},
    isDeleted: {type: Boolean,default: false}
}, { timestamps: true })

module.exports = mongoose.model("Product", productSchema)