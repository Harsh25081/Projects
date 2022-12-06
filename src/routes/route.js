const express = require('express')
const router = express.Router()


const { createUser, userLogin } = require("../controller/usercontrol")
const { createBook, filterBookByQuery, getBookById, updateBookById, deleteBookById } = require("../controller/bookcontrol")
const { createReview, updateReview, deleteReview } = require("../controller/reviewcontrol")
const { authentication, authorization } = require("../middleware/authware")


router.get("/servertest", (req, res) => res.send("Server is working fine !"))


router.post("/register", createUser)
router.post("/login", userLogin)


router.post("/books",  authentication, authorization,createBook) 
router.get("/books", authentication, filterBookByQuery)
router.get("/books/:bookId", authentication, getBookById)
router.put("/books/:bookId", authentication, authorization, updateBookById)
router.delete("/books/:bookId", authentication, authorization, deleteBookById)


router.post("/books/:bookId/review", createReview)
router.put("/books/:bookId/review/:reviewId", updateReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)



module.exports = router