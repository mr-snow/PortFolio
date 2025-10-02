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

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images');
//   },
//   filename: (req, file, cb) => {
//     console.log(file);
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') cb(null, 'public/images');
    else if (file.fieldname === 'resumePdf') cb(null, 'public/resume');
    else if (file.fieldname === 'cvPdf') cb(null, 'public/cv');
    else cb(null, 'public/others');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/signup', createUser);
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'resumePdf', maxCount: 1 },
    { name: 'cvPdf', maxCount: 1 },
  ]),
  updateUser
);

module.exports = router;
