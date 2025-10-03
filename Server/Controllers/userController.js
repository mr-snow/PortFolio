const { default: mongoose } = require('mongoose');
const userModel = require('../db/models/userModel');
const fs = require('fs');

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
//     const body = { ...req.body };

//     // Parse JSON fields
//     [
//       'bio',
//       'social',
//       'skills',
//       'currentStatus',
//       'certificates',
//       'projects',
//       'experience',
//       'education',
//     ].forEach(field => {
//       if (body[field]) {
//         try {
//           body[field] = JSON.parse(body[field]);
//         } catch (err) {
//           // already object, ignore
//         }
//       }
//     });

//     // Handle files
//     if (req.files) {
//       if (req.files['image']) {
//         body.image = `images/${req.files['image'][0].filename}`;
//       }
//       if (req.files['resumePdf']) {
//         body.resumePdf = `resume/${req.files['resumePdf'][0].filename}`;
//       }
//       if (req.files['cvPdf']) {
//         body.cvPdf = `cv/${req.files['cvPdf'][0].filename}`;
//       }

//       // Handle project images
//       if (req.files['projectImage'] && Array.isArray(body.projects)) {
//         body.projects = body.projects.map((proj, idx) => ({
//           ...proj,
//           image: req.files['projectImage'][idx]
//             ? `projectImage/${req.files['projectImage'][idx].filename}`
//             : proj.image,
//         }));
//       }

//       if (req.files['projectImage'] && Array.isArray(body.projects)) {
//   body.projects = body.projects.map((proj, idx) => ({
//     ...proj,
//     image: req.files['projectImage'][idx]
//       ? `projectImage/${req.files['projectImage'][idx].filename}`
//       : proj.image, // ensure this is string
//   }));
// }

//       // Handle skill images
//       if (req.files['skillImage'] && Array.isArray(body.skills)) {
//         body.skills = body.skills.map((skill, idx) => ({
//           ...skill,
//           image: req.files['skillImage'][idx]
//             ? `skillImage/${req.files['skillImage'][idx].filename}`
//             : skill.image,
//         }));
//       }
//     }

//     if (req.files['certificateImage'] && Array.isArray(body.certificates)) {
//       body.certificates = body.certificates.map((cert, idx) => ({
//         ...cert,
//         image: req.files['certificateImage'][idx]
//           ? `certificate/${req.files['certificateImage'][idx].filename}`
//           : cert.image,
//       }));
//     }

//     const response = await userModel.findByIdAndUpdate(
//       id,
//       { $set: body },
//       { new: true }
//     );

//     return res
//       .status(200)
//       .json({ message: 'User updated successfully', data: response });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: error.message || 'User update failed' });
//   }
// };
// module.exports.updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const body = { ...req.body };

//     // Parse JSON fields
//     [
//       'bio',
//       'social',
//       'skills',
//       'currentStatus',
//       'certificates',
//       'projects',
//       'experience',
//       'education',
//     ].forEach(field => {
//       if (body[field]) {
//         try {
//           body[field] = JSON.parse(body[field]);
//         } catch (err) {
//           // already object, ignore
//         }
//       }
//     });

//     // Handle files using indexed field names
//     if (req.files) {
//       req.files.forEach(file => {
//         const idx = file.fieldname.split('_')[1]; // might be undefined

//         if (file.fieldname === 'image' && file.filename) {
//           body.image = `images/${file.filename}`;
//         } else if (file.fieldname === 'resumePdf' && file.filename) {
//           body.resumePdf = `resume/${file.filename}`;
//         } else if (file.fieldname === 'cvPdf' && file.filename) {
//           body.cvPdf = `cv/${file.filename}`;
//         }
//         // Projects
//         else if (
//           file.fieldname.startsWith('projectImage') &&
//           Array.isArray(body.projects) &&
//           body.projects[idx]
//         ) {
//           if (file.filename) {
//             body.projects[idx].image = `projectImage/${file.filename}`;
//           } else if (!body.projects[idx].image && req.body.projects) {
//             body.projects[idx].image = JSON.parse(req.body.projects)[idx]?.image || null;
//           }
//         }
//         // Skills
//         else if (
//           file.fieldname.startsWith('skillImage') &&
//           Array.isArray(body.skills) &&
//           body.skills[idx]
//         ) {
//           if (file.filename) {
//             body.skills[idx].image = `skillImage/${file.filename}`;
//           } else if (!body.skills[idx].image && req.body.skills) {
//             body.skills[idx].image = JSON.parse(req.body.skills)[idx]?.image || null;
//           }
//         }
//         // Certificates
//         else if (
//           file.fieldname.startsWith('certificateImage') &&
//           Array.isArray(body.certificates) &&
//           body.certificates[idx]
//         ) {
//           if (file.filename) {
//             body.certificates[idx].image = `certificate/${file.filename}`;
//           } else if (!body.certificates[idx].image && req.body.certificates) {
//             body.certificates[idx].image = JSON.parse(req.body.certificates)[idx]?.image || null;
//           }
//         }
//       });
//     }

//     // Update user in DB
//     const response = await userModel.findByIdAndUpdate(
//       id,
//       { $set: body },
//       { new: true }
//     );

//     return res
//       .status(200)
//       .json({ message: 'User updated successfully', data: response });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: error.message || 'User update failed' });
//   }
// };

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
