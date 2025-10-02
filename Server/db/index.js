const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/portfolio')
  .then(() => {
    console.log('db conntected');
  })
  .catch(error => {
    console.log('db error ', error);
  });

  module.exports=mongoose