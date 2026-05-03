import Product from '../models/sql/Product.js';
import Category from '../models/sql/Category.js';

// Helper to create URL-friendly slugs
const createSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

// Helper to format ID for responses and parse JSON fields
const parseJson = (val) => {
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch (e) { return val; }
    }
    return val;
};

const formatResponse = (data) => {
    if (Array.isArray(data)) {
        return data.map(item => {
            const json = item.toJSON();
            const formatted = { ...json, _id: json.id };
            if (formatted.availableWeights) formatted.availableWeights = parseJson(formatted.availableWeights);
            if (formatted.nutrition) formatted.nutrition = parseJson(formatted.nutrition);
            if (formatted.images) formatted.images = parseJson(formatted.images);
            return formatted;
        });
    }
    const json = data.toJSON();
    const formatted = { ...json, _id: json.id };
    if (formatted.availableWeights) formatted.availableWeights = parseJson(formatted.availableWeights);
    if (formatted.nutrition) formatted.nutrition = parseJson(formatted.nutrition);
    if (formatted.images) formatted.images = parseJson(formatted.images);
    return formatted;
};

const generateMongoId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

// @desc    Fetch single product by slug
// @route   GET /api/products/slug/:categorySlug/:productSlug
export const getProductBySlug = async (req, res) => {
    try {
        const { productSlug } = req.params;
        const product = await Product.findOne({ 
            where: { 
                slug: productSlug,
                isActive: true 
            } 
        });
        
        if (product) {
            // Check if category is active
            const category = await Category.findOne({ where: { name: product.category } });
            if (category && category.isActive) {
                res.json(formatResponse(product));
            } else {
                res.status(404).json({ message: 'Product belongs to an inactive category' });
            }
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
        const isAdminRequest = req.query.admin === 'true';
        let products;
        
        if (isAdminRequest) {
            products = await Product.findAll({});
        } else {
            // Fetch active categories first to ensure we only show products from active categories
            const activeCategories = await Category.findAll({ where: { isActive: true } });
            const activeCategoryNames = activeCategories.map(c => c.name);
            
            products = await Product.findAll({ 
                where: { 
                    isActive: true,
                    category: activeCategoryNames
                } 
            });
        }
        
        res.json(formatResponse(products));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (product) {
            res.json(formatResponse(product));
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
        console.log('[DEBUG] Creating product with body:', JSON.stringify(req.body, null, 2));
        
        const { 
            name, description, price, originalPrice, category, flashSale, 
            discount, isBestSeller, isTopRated, isFeatured, stock, 
            color, weight, unit, availableWeights, nutrition, isActive 
        } = req.body;
        
        let images = [];
        if (req.files && req.files.length > 0) {
            console.log(`[DEBUG] Uploading ${req.files.length} images to R2...`);
            try {
                const { uploadToR2 } = await import('../config/cloudflareR2.js');
                const uploadPromises = req.files.map(file => uploadToR2(file.buffer, file.originalname, 'products'));
                images = await Promise.all(uploadPromises);
                console.log('[DEBUG] R2 Upload Success:', images);
            } catch (r2Error) {
                console.error('[ERROR] Cloudflare R2 Upload Failed:', r2Error);
                return res.status(500).json({ message: 'Image upload failed. Please check R2 configuration.', error: r2Error.message });
            }
        }
        
        const finalImages = images.slice(0, 10);
        let image = finalImages.length > 0 ? finalImages[0] : (req.body.image || '');
        
        if (req.body.primaryImage && finalImages.includes(req.body.primaryImage)) {
            image = req.body.primaryImage;
        }

        let weightsArr = [];
        if (availableWeights) {
            try {
                weightsArr = typeof availableWeights === 'string' 
                    ? JSON.parse(availableWeights) 
                    : availableWeights;
            } catch (e) {
                console.warn('[DEBUG] Failed to parse availableWeights JSON, falling back to comma split');
                weightsArr = typeof availableWeights === 'string'
                    ? availableWeights.split(',').map(w => ({ value: w.trim(), price: parseFloat(price) || 0 })).filter(w => w.value !== '')
                    : availableWeights;
            }
        }

        let nutritionMap = {};
        if (nutrition) {
            try {
                nutritionMap = typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition;
            } catch (e) { 
                console.warn('[DEBUG] Failed to parse nutrition JSON');
                nutritionMap = {}; 
            }
        }

        console.log('[DEBUG] Attempting Product.create...');
        const product = await Product.create({
            id: generateMongoId(),
            name, 
            slug: createSlug(name),
            description, 
            price: price ? String(price) : "0", 
            originalPrice: originalPrice ? String(originalPrice) : null, 
            category, 
            image,
            images: finalImages,
            flashSale: String(flashSale) === 'true',
            discount: discount ? parseFloat(discount) : 0,
            isBestSeller: String(isBestSeller) === 'true',
            isTopRated: String(isTopRated) === 'true',
            isFeatured: String(isFeatured) === 'true',
            isActive: isActive !== undefined ? String(isActive) === 'true' : true,
            stock: stock ? parseInt(stock) : 0,
            color: color || null, 
            weight: weight ? parseFloat(weight) : 0, 
            unit: unit || 'gram', 
            availableWeights: weightsArr,
            nutrition: nutritionMap
        });

        console.log('[DEBUG] Product created successfully:', product.id);
        res.status(201).json(formatResponse(product));
    } catch (error) {
        console.error('[CRITICAL] Product Creation Failed:', error);
        res.status(500).json({ 
            message: 'Database operation failed', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

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
            product.isActive = req.body.isActive !== undefined ? String(req.body.isActive) === 'true' : product.isActive;
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

            if (req.body.nutrition !== undefined) {
                try {
                    product.nutrition = typeof req.body.nutrition === 'string' 
                        ? JSON.parse(req.body.nutrition) 
                        : req.body.nutrition;
                } catch (e) { /* skip */ }
            }

            if (req.files && req.files.length > 0 || req.body.images) {
                const { uploadToR2, deleteFromR2 } = await import('../config/cloudflareR2.js');
                
                let existingImages = [];
                if (req.body.images) {
                    try {
                        existingImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
                    } catch (e) {
                        existingImages = product.images || [];
                    }
                } else {
                    existingImages = product.images || [];
                }

                // Delete images that are no longer in the product
                const oldImages = product.images || [];
                const imagesToDelete = oldImages.filter(img => !existingImages.includes(img));
                if (imagesToDelete.length > 0) {
                    console.log(`[CLEANUP] Deleting ${imagesToDelete.length} removed images...`);
                    await Promise.all(imagesToDelete.map(img => deleteFromR2(img)));
                }
                
                let newlyUploaded = [];
                if (req.files && req.files.length > 0) {
                    const uploadPromises = req.files.map(file => uploadToR2(file.buffer, file.originalname, 'products'));
                    newlyUploaded = await Promise.all(uploadPromises);
                }

                const isNewPrimary = req.body.primaryIsNew === 'true';
                const combined = isNewPrimary 
                    ? [...newlyUploaded, ...existingImages].slice(0, 10)
                    : [...existingImages, ...newlyUploaded].slice(0, 10);
                
                product.images = combined;
                
                if (req.body.primaryImage && combined.includes(req.body.primaryImage)) {
                    product.image = req.body.primaryImage;
                } else if (combined.length > 0) {
                    product.image = combined[0];
                }
            }

            const updatedProduct = await product.save();
            res.json(formatResponse(updatedProduct));
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
        const product = await Product.findByPk(req.params.id);
        if (product) {
            // Delete images from R2
            if (product.images && product.images.length > 0) {
                try {
                    const { deleteFromR2 } = await import('../config/cloudflareR2.js');
                    await Promise.all(product.images.map(img => deleteFromR2(img)));
                    console.log(`[CLEANUP] Deleted ${product.images.length} images for product: ${product.id}`);
                } catch (e) {
                    console.error('[CLEANUP] Failed to delete product images from R2:', e);
                }
            }
            await product.destroy();
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
            id: generateMongoId(),
            slug: createSlug(p.name),
            flashSale: Boolean(p.flashSale),
            isBestSeller: Boolean(p.isBestSeller),
            isFeatured: Boolean(p.isFeatured),
            availableWeights: Array.isArray(p.availableWeights) ? p.availableWeights : []
        }));

        const createdProducts = await Product.bulkCreate(formattedProducts);
        res.status(201).json(formatResponse(createdProducts));
    } catch (error) {
        res.status(500).json({ message: 'Bulk upload failed: ' + error.message });
    }
};
