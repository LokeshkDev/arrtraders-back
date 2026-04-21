import mongoose from 'mongoose';
const URI = 'mongodb+srv://arrtraderduser:TraderUDB2413@arrtradersdb.vxikomf.mongodb.net/?appName=arrTradersDb';

const productSchema = new mongoose.Schema({
  name: String,
  isBestSeller: Boolean,
  isFeatured: Boolean
});

const Product = mongoose.model('Product', productSchema);

async function check() {
  await mongoose.connect(URI);
  console.log('Connected to DB');
  const products = await Product.find({});
  console.log('Total products:', products.length);
  const bestSellers = products.filter(p => p.isBestSeller);
  console.log('Best Sellers:', bestSellers.map(p => p.name));
  const featured = products.filter(p => p.isFeatured);
  console.log('Featured:', featured.map(p => p.name));
  process.exit();
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});
