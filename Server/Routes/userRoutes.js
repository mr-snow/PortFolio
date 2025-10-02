const {
  createUser,
  loginUser,
  getUser,
  getUsers,
  deleteUser,
  updateUser,
} = require('../Controllers/userController');

const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/signup', createUser);
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch('/:id', upload.single('image'), updateUser);

module.exports = router;
