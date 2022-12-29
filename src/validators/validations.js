const mongoose = require('mongoose')


//=========================// isValidEmail //===================================

const isValidEmail = function (value) {
  let emailRegex =
  /^([a-zA-Z0-9_\.\-])+\@([a-z])+\.([a-z]{2,3})$/i;
  if (emailRegex.test(value)) return true;
};

//============================// idCharacterValid //============================

const isValidObjectId = function (value) {
  return mongoose.Types.ObjectId.isValid(value); 
};

//==========================// isValidString //==================================

const isValidString = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

//==============================// isValidName //===============================

const isValidName = function (name) {
  if (/^[a-z A-Z ]+$/.test(name)) {
    return true;
  }
};

//==============================// isValidMobile //===============================

const isValidPhone = function (phone) {
 if (/^[0]?[6789]\d{9}$/.test(phone)){
    return true
 }
}
//==============================// isValidPassword //==============================

const isValidPassword = function(password){
  if (/^(?=.*[0-9])(?=.*[!.@#$%^&*])[a-zA-Z0-9!.@#$%^&*]{8,15}$/.test(password)){
    return true
  }
}
//==============================// isValid-pincode //==============================

const isValidPincode = function (pincode) {
  if (/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/.test(pincode)) return true
  return false
}

const isValidBody=function(body){
  if(Object.keys(body).length!=0){
    return true
  }
  else{return false}
}
//=============================// module exports //==============================

module.exports = { isValidName, isValidEmail, isValidObjectId, isValidString,  isValidPhone, isValidPassword, isValidPincode ,isValidBody}