const {
  createUser,
  loginUser,
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  updateUserApproval
} = require('../Controllers/userController');
const fs = require('fs');

const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = '';

    if (file.fieldname === 'image') folder = 'public/images';
    else if (file.fieldname === 'resumePdf') folder = 'public/resume';
    else if (file.fieldname === 'cvPdf') folder = 'public/cv';
    else if (file.fieldname.startsWith('projectImage'))
      folder = 'public/projectImage';
    else if (file.fieldname.startsWith('skillImage'))
      folder = 'public/skillImage';
    else if (file.fieldname.startsWith('certificateImage'))
      folder = 'public/certificate';

    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
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
router.patch('/:id', upload.any(), updateUser);
router.patch('/approval/:id', updateUserApproval);

module.exports = router;
