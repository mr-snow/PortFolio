const mongoose = require('mongoose');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('db conntected');
  })
  .catch(error => {
    console.log('db error ', error);
  });

  module.exports=mongoose