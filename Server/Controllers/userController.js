const { default: mongoose } = require('mongoose');
const userModel = require('../db/models/userModel');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

module.exports.createUser = async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    return res.status(201).json({
      message: 'User created successfully',
      data: { id: user._id, email: user.email },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'User creation failed' });
  }
};

// module.exports.loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const response = await userModel.find({ email, password });

//     if (!response || response.length === 0) {
//       throw new Error('Account not found !');
//     }
//     return res
//       .status(201)
//       .json({ message: 'user login successful', data: response });

//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: error.message || 'user login Failed' });
//   }
// };

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) throw new Error('Account not found');
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error('Invalid credentials');
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({
      message: 'User login successful',
      data: { id: user._id, email: user.email },
      token: token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'User login failed' });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(id);
    if (!userId) {
      return res.status(404).json({ message: 'id not found ' });
    }
    const response = await userModel.findById(id);
    return res
      .status(200)
      .json({ message: 'user get successful', data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'user fetching Failed' });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    const response = await userModel.find();
    return res
      .status(200)
      .json({ message: 'users get successful', data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'users fetching Failed' });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(id);
    if (!userId) {
      throw new Error('id is missing ');
      // return res.status(404).json({ message: 'id not found ' });
    }
    const response = await userModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: 'user delete successful', data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'user deletion Failed' });
  }
};

module.exports.updateUserApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approval } = req.body;
    const validValues = ['pending', 'failed', 'approval'];
    if (!validValues.includes(approval)) {
      return res.status(400).json({ message: 'Invalid approval value' });
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { $set: { approval } },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: 'User approval updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: error.message || 'Failed to update approval' });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    // Fetch existing user to preserve old images if no new file is uploaded
    const existingUser = await userModel.findById(id);

    // Parse JSON fields
    [
      'bio',
      'social',
      'skills',
      'currentStatus',
      'certificates',
      'projects',
      'experience',
      'education',
    ].forEach(field => {
      if (body[field]) {
        try {
          body[field] = JSON.parse(body[field]);
        } catch (err) {
          // already object, ignore
        }
      }
    });

    if (body.notes && typeof body.notes === 'string') {
      body.notes = body.notes.trim();
    }

    // Helper to merge images with existing user data
    const mergeImages = (newArray, existingArray) => {
      if (!Array.isArray(newArray)) return existingArray || [];
      return newArray.map((item, idx) => {
        const existingItem = existingArray?.[idx] || {};
        return {
          ...item,
          image: item.image || existingItem.image || null,
        };
      });
    };

    // Merge images for nested arrays
    body.projects = mergeImages(body.projects, existingUser.projects);
    body.skills = mergeImages(body.skills, existingUser.skills);
    body.certificates = mergeImages(
      body.certificates,
      existingUser.certificates
    );

    // Handle uploaded files
    if (req.files) {
      req.files.forEach(file => {
        const idx = file.fieldname.split('_')[1]; // may be undefined

        if (file.fieldname === 'image' && file.filename) {
          body.image = `images/${file.filename}`;
        } else if (file.fieldname === 'resumePdf' && file.filename) {
          body.resumePdf = `resume/${file.filename}`;
        } else if (file.fieldname === 'cvPdf' && file.filename) {
          body.cvPdf = `cv/${file.filename}`;
        } else if (
          file.fieldname.startsWith('projectImage') &&
          Array.isArray(body.projects) &&
          body.projects[idx]
        ) {
          body.projects[idx].image = `projectImage/${file.filename}`;
        } else if (
          file.fieldname.startsWith('skillImage') &&
          Array.isArray(body.skills) &&
          body.skills[idx]
        ) {
          body.skills[idx].image = `skillImage/${file.filename}`;
        } else if (
          file.fieldname.startsWith('certificateImage') &&
          Array.isArray(body.certificates) &&
          body.certificates[idx]
        ) {
          body.certificates[idx].image = `certificate/${file.filename}`;
        }
      });
    }

    // Update user in DB
    const response = await userModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    return res
      .status(200)
      .json({ message: 'User updated successfully', data: response });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || 'User update failed' });
  }
};
