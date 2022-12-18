const mongoose = require('mongoose')
const reviewModel = require("../models/reviewmodel")
const bookModel = require("../models/bookmodel")
const {isValidObjectId}=mongoose
const moment = require('moment/moment')


exports.createReview = async (req, res) => {
    try {

        let bookID = req.params.bookId

        if (!isValidObjectId(bookID)) {
            return res.status(400).send({ status: false, message: "Enter a valid book id" })
        }

        let bookData = await bookModel.findOne({ isDeleted: false, _id: bookID})

        if (!bookData) return res.status(404).send({ status: false, message: "Book not found with this book ID" })

        let bodyData = req.body
        let { rating ,review} = bodyData

        if (Object.keys(bodyData).length == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" })
        }
      
        if (!rating) {
            return res.status(400).send({ status: false, message: "Please give rating it is mandatory" })
        }
        if (![1, 2, 3, 4, 5].includes(bodyData.rating)) {
            return res.status(400).send({ status: false, message: "Give a rating between 1 to 5" })
        }
        if(!review){return res.status(400).send({status:false,message:"Pls provide review it is mandatory"})}
       
        bodyData.bookId = bookID
        bodyData.reviewedAt = moment()

        let createreview = await reviewModel.create(bodyData)

        let updatedBook = await bookModel.findOneAndUpdate({ _id: bookID, isDeleted: false }, { $inc: { reviews: 1 } }).lean()

        updatedBook.reviewsData = createreview

        return res.status(201).send({ status: true, message: 'Success', data: updatedBook })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


exports.updateReview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId
        let data = req.body

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid BookId" })
        }
        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Review Id" })
        }


        let checkbook = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({__v:0,ISBN:0}).lean()
        if (!checkbook) {
            return res.status(404).send({ status: false, message: "No book exists with this Book Id" })
        }


        let checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReview) {
            return res.status(404).send({ status: false, message: "No review exists with this Review Id" })
        }

        if (bookId != checkReview.bookId) {
            return res.status(400).send({ status: false, message: "The review you want to update doesn't belongs to the given book/bookId" })
        }
        const isFilled = function(value){
            if(typeof value === "string" && value.trim().length === 0) return false;
             return true 
         }
         if(!isFilled(data.rating)){
            return res.status(400).send({ status: false, message: "rating can not be empty" })
         }
        if(data.rating ){
            if(data.rating)rating = data.rating.toString()
        if (!["1", "2", "3", "4", "5"].includes(rating)) {
            return res.status(400).send({ status: false, message: "Give a rating between 1 to 5" })
        }
    }


        let updateReview = await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false },
            { $set: data }, { new: true }).select({bookId:1,reviewedBy:1,reviewedAt:1,rating:1,review:1})

        checkbook.reviewsData = updateReview

        return res.status(200).send({ status: true, message: "Success", data: checkbook })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


exports.deleteReview = async (req, res) => {
    try {
        let bookId = req.params.bookId
        let reviewId = req.params.reviewId

        if (!mongoose.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid BookId" })
        }
        if (!mongoose.isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Review Id" })
        }


        let checkbook = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!checkbook) {
            return res.status(404).send({ status: false, message: "No book exists with this Book Id" })
        }
        let checkReview = await reviewModel.findOne({ _id: reviewId, isDeleted: false })
        if (!checkReview) {
            return res.status(404).send({ status: false, message: "No review exists with this Review Id" })
        }


        if (bookId != checkReview.bookId) {
            return res.status(400).send({ status: false, message: "The review you want to delete doesn't belongs to the given book/bookId" })
        }


        await reviewModel.findOneAndUpdate({ _id: reviewId, isDeleted: false }, { $set: { isDeleted: true } })
        await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: -1 } })

        return res.status(200).send({ status: true, message: "Success", data: "Review deleted successfully !" })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}