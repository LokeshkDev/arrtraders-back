import Product from '../models/Product.js';
import Category from '../models/Category.js';

// Helper to create URL-friendly slugs
const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

// @desc    Migrate existing data to include slugs
// @route   POST /api/products/migrate-slugs
export const migrateSlugs = async (req, res) => {
    try {
        const products = await Product.find({ slug: { $exists: false } });
        const categories = await Category.find({ slug: { $exists: false } });

        const productPromises = products.map(p => {
            p.slug = createSlug(p.name);
            return p.save();
        });

        const categoryPromises = categories.map(c => {
            c.slug = createSlug(c.name);
            return c.save();
        });

        await Promise.all([...productPromises, ...categoryPromises]);

        res.json({ 
            message: 'Migration complete', 
            productsMigrated: products.length,
            categoriesMigrated: categories.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:categorySlug/:productSlug
export const getProductBySlug = async (req, res) => {
    try {
        const { productSlug } = req.params;
        const product = await Product.findOne({ slug: productSlug });
        
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
export const createProduct = async (req, res) => {
    try {
        const { 
            name, description, price, originalPrice, category, flashSale, 
            discount, isBestSeller, isTopRated, isFeatured, stock, 
            color, weight, unit, availableWeights, nutrition 
        } = req.body;
        
        let images = [];
        if (req.files && req.files.length > 0) {
            const { uploadToR2 } = await import('../config/cloudflareR2.js');
            const uploadPromises = req.files.map(file => uploadToR2(file.buffer, file.originalname, 'products'));
            images = await Promise.all(uploadPromises);
        }
        
        // Finalize image array and set primary
        const finalImages = images.slice(0, 5);
        let image = finalImages.length > 0 ? finalImages[0] : req.body.image;
        
        // If frontend specified a main image from the body (URL)
        if (req.body.primaryImage && finalImages.includes(req.body.primaryImage)) {
            image = req.body.primaryImage;
        }

        // Handle stringified options from multipart form
        let weightsArr = [];
        if (availableWeights) {
            try {
                // Try parsing as JSON for the new structured data [{value, price}]
                weightsArr = typeof availableWeights === 'string' 
                    ? JSON.parse(availableWeights) 
                    : availableWeights;
            } catch (e) {
                // Fallback for legacy comma-separated strings
                weightsArr = typeof availableWeights === 'string'
                    ? availableWeights.split(',').map(w => ({ value: w.trim(), price: price || 0 })).filter(w => w.value !== '')
                    : availableWeights;
            }
        }

        // Parse nutrition JSON
        let nutritionMap = undefined;
        if (nutrition) {
            try {
                nutritionMap = typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition;
            } catch (e) { nutritionMap = undefined; }
        }

        const product = new Product({
            name, 
            slug: createSlug(name),
            description, price, originalPrice, category, image,
            images: finalImages,
            flashSale: String(flashSale) === 'true',
            discount,
            isBestSeller: String(isBestSeller) === 'true',
            isTopRated: String(isTopRated) === 'true',
            isFeatured: String(isFeatured) === 'true',
            stock,
            color, weight, unit, availableWeights: weightsArr,
            nutrition: nutritionMap
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk migrate single image field to images array
export const migrateGallery = async (req, res) => {
    try {
        const products = await Product.find({ 
            $or: [
                { images: { $exists: false } },
                { images: { $size: 0 } }
            ],
            image: { $exists: true, $ne: '' }
        });

        const promises = products.map(p => {
            p.images = [p.image];
            return p.save();
        });

        await Promise.all(promises);
        
        if (res) {
            res.json({ message: 'Gallery migration complete', count: products.length });
        } else {
            console.log(`Gallery migration complete: ${products.length} products updated.`);
        }
    } catch (error) {
        if (res) res.status(500).json({ message: error.message });
    }
};

// Run migration automatically if this file is imported (once)
migrateGallery().catch(err => console.error('Auto migration failed:', err));

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            if (req.body.name && req.body.name !== product.name) {
                product.name = req.body.name;
                product.slug = createSlug(req.body.name);
            }
            product.description = req.body.description || product.description;
            product.price = req.body.price || product.price;
            product.originalPrice = req.body.originalPrice || product.originalPrice;
            product.category = req.body.category || product.category;
            product.flashSale = req.body.flashSale !== undefined ? String(req.body.flashSale) === 'true' : product.flashSale;
            product.discount = req.body.discount || product.discount;
            product.isBestSeller = req.body.isBestSeller !== undefined ? String(req.body.isBestSeller) === 'true' : product.isBestSeller;
            product.isTopRated = req.body.isTopRated !== undefined ? String(req.body.isTopRated) === 'true' : product.isTopRated;
            product.isFeatured = req.body.isFeatured !== undefined ? String(req.body.isFeatured) === 'true' : product.isFeatured;
            product.stock = req.body.stock || product.stock;
            product.color = req.body.color || product.color;
            product.weight = req.body.weight || product.weight;
            product.unit = req.body.unit || product.unit;

            if (req.body.availableWeights !== undefined) {
                try {
                    product.availableWeights = typeof req.body.availableWeights === 'string' 
                        ? JSON.parse(req.body.availableWeights) 
                        : req.body.availableWeights;
                } catch (e) {
                    product.availableWeights = typeof req.body.availableWeights === 'string'
                        ? req.body.availableWeights.split(',').map(w => ({ value: w.trim(), price: product.price || 0 }))
                        : req.body.availableWeights;
                }
            }

            // Handle nutrition
            if (req.body.nutrition !== undefined) {
                try {
                    product.nutrition = typeof req.body.nutrition === 'string' 
                        ? JSON.parse(req.body.nutrition) 
                        : req.body.nutrition;
                } catch (e) { /* skip */ }
            }

            if (req.files && req.files.length > 0 || req.body.images) {
                const existingImages = req.body.images ? (typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images) : (product.images || []);
                
                let newlyUploaded = [];
                if (req.files && req.files.length > 0) {
                    const { uploadToR2 } = await import('../config/cloudflareR2.js');
                    const uploadPromises = req.files.map(file => uploadToR2(file.buffer, file.originalname, 'products'));
                    newlyUploaded = await Promise.all(uploadPromises);
                }

                // Combine correctly. If frontend marked a new upload as primary, it should be first.
                const isNewPrimary = req.body.primaryIsNew === 'true';
                const combined = isNewPrimary 
                    ? [...newlyUploaded, ...existingImages].slice(0, 5)
                    : [...existingImages, ...newlyUploaded].slice(0, 5);
                
                product.images = combined;
                
                if (req.body.primaryImage && combined.includes(req.body.primaryImage)) {
                    product.image = req.body.primaryImage;
                } else if (combined.length > 0) {
                    product.image = combined[0];
                }
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create multiple products (Bulk)
// @route   POST /api/products/bulk
export const createMultipleProducts = async (req, res) => {
    try {
        const { products } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of products' });
        }

        const formattedProducts = products.map(p => ({
            ...p,
            slug: createSlug(p.name),
            flashSale: Boolean(p.flashSale),
            isBestSeller: Boolean(p.isBestSeller),
            isFeatured: Boolean(p.isFeatured),
            availableWeights: Array.isArray(p.availableWeights) ? p.availableWeights : []
        }));

        const createdProducts = await Product.insertMany(formattedProducts);
        res.status(201).json(createdProducts);
    } catch (error) {
        res.status(500).json({ message: 'Bulk upload failed: ' + error.message });
    }
};
