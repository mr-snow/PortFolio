const { default: mongoose } = require('mongoose');
const userModel = require('../db/models/userModel');

module.exports.createUser = async (req, res) => {
  try {
    const body = req.body;
    const response = await userModel.create(body);
    return res
      .status(201)
      .json({ message: 'user created successful', data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'user creation Failed' });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const response = await userModel.find({ email, password });

    if (!response || response.length === 0) {
      throw new Error('Account not found !');
    }
    return res
      .status(201)
      .json({ message: 'user login successful', data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || 'user login Failed' });
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

// module.exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const body = req.body;
//     const file = req.file;

//     if (req.file) {
//       body.image = `images/${req.file.filename}`;
//     }

//     const userId = new mongoose.Types.ObjectId(id);
//     if (!userId) {
//       throw new Error('id is missing ');
//     }

//     const response = await userModel.findByIdAndUpdate(
//       { _id: id },
//       {
//         $set: body,
//       },
//       { new: true }
//     );
//     return res
//       .status(200)
//       .json({ message: 'user update successful', data: response, file });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: error.message || 'user upation Failed' });
//   }
// };

// module.exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     let body = req.body;

//     if (!id) throw new Error('User ID is missing');

//     // Handle uploaded files
//     if (req.files) {
//       if (req.files.image) body.image = `images/${req.files.image[0].filename}`;
//       if (req.files.resumePdf)
//         body.resumePdf = `images/${req.files.resumePdf[0].filename}`;
//       if (req.files.cvPdf) body.cvPdf = `images/${req.files.cvPdf[0].filename}`;
//     }

//     // Parse JSON fields
//     [
//       'bio',
//       'social',
//       'skills',
//       'currentStatus',
//       'projects',
//       'experience',
//       'education',
//     ].forEach(field => {
//       if (body[field]) {
//         try {
//           body[field] = JSON.parse(body[field]);
//         } catch (err) {
//           console.log(`Failed to parse ${field}:`, err.message);
//         }
//       }
//     });

//     // Convert dates for projects, experience, education
//     const parseDates = arr =>
//       arr?.map(item => ({
//         ...item,
//         startDate: item.startDate ? new Date(item.startDate) : null,
//         endDate: item.endDate ? new Date(item.endDate) : null,
//       }));

//     if (body.projects) body.projects = parseDates(body.projects);
//     if (body.experience) body.experience = parseDates(body.experience);
//     if (body.education) body.education = parseDates(body.education);

//     // Update user
//     const response = await userModel.findByIdAndUpdate(
//       id,
//       { $set: body },
//       { new: true }
//     );

//     return res.status(200).json({
//       message: 'User updated successfully',
//       data: response,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: error.message || 'User update failed',
//     });
//   }
// };


module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    // Parse JSON fields that are sent as strings
    ['bio', 'social', 'skills', 'currentStatus', 'projects', 'experience', 'education'].forEach(field => {
      if (body[field]) {
        try {
          body[field] = JSON.parse(body[field]);
        } catch (err) {
          // Keep original if already object
        }
      }
    });

    // Handle files
    if (req.files) {
      if (req.files['image']) body.image = `images/${req.files['image'][0].filename}`;
      if (req.files['resumePdf']) body.resumePdf = `resume/${req.files['resumePdf'][0].filename}`;
      if (req.files['cvPdf']) body.cvPdf = `cv/${req.files['cvPdf'][0].filename}`;
    }

    const response = await userModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    return res.status(200).json({ message: 'User updated successfully', data: response });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'User update failed' });
  }
};

