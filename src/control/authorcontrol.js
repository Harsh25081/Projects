const authormodel = require('../Models/author')
const jwt = require('jsonwebtoken')
let emailvalid = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
let namevalid = /^[a-zA-Z]{1,20}$/

/////////////////////~CreateAuthor ~/////////////////////////
const createAuthor = async function (req, res) {
  try {
    let token = req.headers["x-api-key"]
    if (token) { return res.status(400).send({ status: false, msg: "another author token present in header" }) }
    let data = req.body
    let { fname, lname, title, email, password } = data
    if (!fname) { return res.status(400).send({ status: false, msg: "fname is mandatory" }) }
    fname=fname.trim()
    if(!fname.match(namevalid)){return res.status(400).send({status: false, msg:"pls enter valid fname"})}
    if (!lname) { return res.status(400).send({ status: false, msg: "lname is mandatory" }) }
    lname=lname.trim()
    if(!lname.match(namevalid)){return res.status(400).send({status: false, msg:"pls enter valid lname"})}
    if (!title) { return res.status(400).send({ status: false, msg: "title is mandatory" }) }
    title=title.trim()
    if (title == "Mr" || title == "Mrs" || title == "Miss") {
      if (!email) { return res.status(400).send({ status: false, msg: "email is mandatory" }) }
      email=email.trim()
      if (!email.match(emailvalid)) { return res.status(400).send({ status: false, msg: "pls provide a valid email id" }) }
      password=password.trim()
      if (!password) { return res.status(400).send({ status: false, msg: "password is mandatory" }) }
      let emailcheck = await authormodel.findOne({ email })
      if (emailcheck) return res.status(400).send({ status: false, msg: "pls provide a unique email" })
      else {
        let authordata = await authormodel.create(data)
        res.status(201).send({ status: true, data: authordata })
      }
    }
    else { return res.status(400).send({ status: false, Msg: "Pls provide a valid title -Mr,Mrs,Miss " }) }

  } catch (error) {
    console.log("This is the error :", error.message)
    res.status(500).send({ msg: "Error", error: error.message })
  }
}

/////////////////////////////////////////////////////////////
const loginUser = async function (req, res) {
  try {
    let userName = req.body.email;
    let password = req.body.password;
    if (!userName) {
      return res.status(400).send({ status: false, msg: "Insert Email" })
    }
    if (!password) {
      return res.status(400).send({ status: false, msg: "Insert Password" })
    }
    let user = await authormodel.findOne({ email: userName, password: password });
    if (!user)
      return res.status(401).send({ status: false, msg: "username or the password is not corerct", });
    let token = jwt.sign(
      {
        userId: user._id.toString(),
      },
      "project1"
    );
    res.setHeader("x-auth-token", token);
    return res.status(201).send({ status: true, data: {"token":token} });

  } catch (error) {
    res.status(500).send({ status: false, msg: error.message })
  }
}


//////////////////////~Exports Module~///////////////////////
module.exports.createAuthor = createAuthor
module.exports.loginUser = loginUser