const mongoose = require('mongoose');

const socialSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: [
        'linkedin',
        'github',
        'youtube',
        'gmail',
        'mail',
        'phone',
        'website',
      ],
    },
    link: { type: String, required: true },
  },
  { _id: false }
);

const bioSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  location: { type: String },
  currentLocation: { type: String },
  about: { type: String },
  summary: { type: String },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    gitLink: { type: String },
    liveLink: { type: String },
    technologies: [{ type: String }],
    image: { type: String },
    status: {
      type: String,
      enum: ['developing', 'done', 'planned'],
      default: 'developing',
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { _id: false }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    duration: { type: String }, // auto-calculated or manual
    technologies: [{ type: String }],
    location: { type: String },
  },
  { _id: false }
);

experienceSchema.pre('save', function (next) {
  if (this.startDate) {
    const end = this.endDate || new Date();
    const diff = end - this.startDate;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    this.duration = `${years} years ${remainingMonths} months`;
  }
  next();
});

const educationSchema = new mongoose.Schema(
  {
    institute: { type: String, required: true },
    course: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    marks: { type: Number },
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    issueDate: { type: Date },
    link: { type: String },
  },
  { _id: false }
);

const skillCategorySchema = new mongoose.Schema({
  category: String,
  skills: [
    {
      type: String,
    },
  ],
  image: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    title: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    username: { type: String, unique: true },
    image: { type: String },
    phone: { type: String },
    portfolioLink: { type: String },
    notes: { type: String },

    bio: bioSchema,
    social: [socialSchema],
    resumePdf: { type: String },
    cvPdf: { type: String },
    skills: [skillCategorySchema],
    currentStatus: {
      company: { type: String },
      position: { type: String },
      asPresent: { type: Boolean, default: false },
    },
    approval: {
      type: String,
      enum: ['pending', 'failed', 'approval'],
      default: 'pending',
    },

    projects: [projectSchema],
    experience: [experienceSchema],
    education: [educationSchema],
    certificates: [certificateSchema],
  },
  { timestamps: true }
);

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
