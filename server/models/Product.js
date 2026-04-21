import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
  description: { type: String, required: true },
  price: { type: String, required: true }, // Keeping as string to match "₹1,250" logic or can be Number
  originalPrice: { type: String },
  category: { type: String, required: true },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  color: { type: String },
  weight: { type: Number },
  unit: { type: String, enum: ['kg', 'gram', 'ml', 'litre'] },
  availableWeights: [{ 
    value: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number }
  }],
  flashSale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  isBestSeller: { type: Boolean, default: false },
  isTopRated: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  stock: { type: Number, default: 100 },
  nutrition: { type: Map, of: String },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
