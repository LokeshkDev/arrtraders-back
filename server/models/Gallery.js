import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: { type: String },
  image: { type: String, required: true },
  description: { type: String },
  category: { type: String }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
