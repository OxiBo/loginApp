const mongoose = require("mongoose"),
  bcrypt = require("bcrypt-nodejs"); // https://github.com/shaneGirish/bcrypt-nodejs

const { Schema } = mongoose;
delete mongoose.connection.models["users"];
const userSchema = new Schema({
  local: {
    username: String,
    email: String,
    password: String,
    occupation: String,
    age: Number
  },
  google: {
    id: String,
    email: String,
    name: String,
    token: String
  },
  facebook: {
    id: String,
    email: String,
    name: String,
    token: String
  }
});

// generating a hash
userSchema.methods.generateHash = password => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  // console.log(this)
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model("users", userSchema);
