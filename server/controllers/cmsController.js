import Category from '../models/sql/Category.js';
import News from '../models/sql/News.js';
import Gallery from '../models/sql/Gallery.js';
import HomePage from '../models/sql/HomePage.js';
import Page from '../models/sql/Page.js';

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
            // Parse common JSON fields
            ['heroSlides', 'features', 'categoryItems', 'experienceBanners', 'promos', 'heritage', 'couponBanners', 'shippingInfo', 'testimonials'].forEach(field => {
                if (formatted[field]) formatted[field] = parseJson(formatted[field]);
            });
            // Alias parentId to parent for Categories
            if (formatted.parentId !== undefined) {
                formatted.parent = formatted.parentId;
            }
            return formatted;
        });
    }
    if (!data) return null;
    const json = data.toJSON();
    const formatted = { ...json, _id: json.id };
    ['heroSlides', 'features', 'categoryItems', 'experienceBanners', 'promos', 'heritage', 'couponBanners', 'shippingInfo', 'testimonials'].forEach(field => {
        if (formatted[field]) formatted[field] = parseJson(formatted[field]);
    });
    // Alias parentId to parent for Categories
    if (formatted.parentId !== undefined) {
        formatted.parent = formatted.parentId;
    }
    return formatted;
};

const generateMongoId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

// --- CATEGORIES ---
export const getCategories = async (req, res) => {
    try {
        const isAdminRequest = req.query.admin === 'true';
        const filter = isAdminRequest ? {} : { isActive: true };
        const categories = await Category.findAll({ where: filter });
        res.json(formatResponse(categories));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description, parent, isActive } = req.body;
        let image = req.body.image;
        
        if (req.file) {
            const { uploadToR2 } = await import('../config/cloudflareR2.js');
            image = await uploadToR2(req.file.buffer, req.file.originalname, 'category');
        }

        if (!image && !req.body.image) {
            return res.status(400).json({ message: 'Category image is required' });
        }

        const category = await Category.create({ 
            id: generateMongoId(),
            name, 
            slug: createSlug(name),
            description, 
            image: image || req.body.image,
            parentId: parent || null,
            isActive: isActive !== undefined ? String(isActive) === 'true' : true
        });
        res.status(201).json(formatResponse(category));
    } catch (error) {
        console.error('Create Category Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (category) {
            if (req.body.name && req.body.name !== category.name) {
                category.name = req.body.name;
                category.slug = createSlug(req.body.name);
            }
            category.description = req.body.description || category.description;
            category.parentId = req.body.parent === '' ? null : (req.body.parent || category.parentId);
            category.isActive = req.body.isActive !== undefined ? String(req.body.isActive) === 'true' : category.isActive;
            
            if (req.file) {
                const { uploadToR2 } = await import('../config/cloudflareR2.js');
                category.image = await uploadToR2(req.file.buffer, req.file.originalname, 'category');
            } else if (req.body.image) {
                category.image = req.body.image;
            }

            const updatedCategory = await category.save();
            res.json(formatResponse(updatedCategory));
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        console.error('Update Category Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// --- NEWS ---
export const getNews = async (req, res) => {
    try {
        const news = await News.findAll({ order: [['date', 'DESC']] });
        res.json(formatResponse(news));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createNews = async (req, res) => {
    try {
        const { title, content, author, category } = req.body;
        let image = req.body.image;
        
        if (req.file) {
            const { uploadToR2 } = await import('../config/cloudflareR2.js');
            image = await uploadToR2(req.file.buffer, req.file.originalname, 'cms');
        }

        const news = await News.create({ 
            id: generateMongoId(),
            title, content, author, category, image 
        });
        res.status(201).json(formatResponse(news));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GALLERY ---
export const getGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findAll({});
        res.json(formatResponse(gallery));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGallery = async (req, res) => {
    try {
        const { title, description, category } = req.body;
        let image = req.body.image;
        
        if (req.file) {
            const { uploadToR2 } = await import('../config/cloudflareR2.js');
            image = await uploadToR2(req.file.buffer, req.file.originalname, 'cms');
        }

        const gallery = await Gallery.create({ 
            id: generateMongoId(),
            title, description, category, image 
        });
        res.status(201).json(formatResponse(gallery));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- DELETE HANDLERS ---
export const deleteCategory = async (req, res) => {
    try {
        await Category.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNews = async (req, res) => {
    try {
        await News.destroy({ where: { id: req.params.id } });
        res.json({ message: 'News removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGallery = async (req, res) => {
    try {
        await Gallery.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Gallery item removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- HOMEPAGE CMS ---
export const getHomePageCMS = async (req, res) => {
    try {
        let homepage = await HomePage.findOne({});
        if (!homepage) {
            homepage = await HomePage.create({ id: generateMongoId() });
        }
        res.json(formatResponse(homepage));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateHomePageCMS = async (req, res) => {
    try {
        let homepage = await HomePage.findOne({});
        if (!homepage) {
            homepage = await HomePage.create({ id: generateMongoId() });
        }
        
        // Update all fields
        const fields = [
            'heroSlides', 'featuredBtnText', 'featuredBtnLink', 'bestSellersBtnText', 
            'bestSellersBtnLink', 'features', 'categoryItems', 'experienceBanners', 
            'promos', 'heritage', 'couponBanners', 'shippingInfo', 'testimonials', 
            'showHero', 'showFeatures', 'showCategories', 'showBestSellers', 
            'showFeatured', 'showFlashSale', 'showExperience', 'showTestimonials', 
            'flashSaleEndTime', 'freeShippingThreshold', 'deliveryCharge'
        ];

        fields.forEach(f => {
            if (req.body[f] !== undefined) {
                homepage[f] = req.body[f];
            }
        });
        
        const updatedHomePage = await homepage.save();
        res.json(formatResponse(updatedHomePage));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// --- HERO BG IMAGE UPLOAD (Cloudflare R2) ---
export const uploadHeroBgImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        const { uploadToR2 } = await import('../config/cloudflareR2.js');
        const publicUrl = await uploadToR2(req.file.buffer, req.file.originalname, 'cms');
        res.json({ url: publicUrl });
    } catch (error) {
        console.error('R2 upload error:', error);
        res.status(500).json({ message: 'Image upload failed: ' + error.message });
    }
}

// --- CMS PAGES (About, Contact, Shipping, etc.) ---
export const getPages = async (req, res) => {
    try {
        const pages = await Page.findAll();
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPageBySlug = async (req, res) => {
    try {
        const page = await Page.findOne({ where: { slug: req.params.slug } });
        if (page) {
            res.json(page);
        } else {
            // Return empty structure if page doesn't exist yet
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePage = async (req, res) => {
    try {
        const { slug } = req.params;
        const { title, content } = req.body;
        let { bannerImage } = req.body;

        if (req.file) {
            const { uploadToR2 } = await import('../config/cloudflareR2.js');
            bannerImage = await uploadToR2(req.file.buffer, req.file.originalname, 'pages');
        }

        let page = await Page.findOne({ where: { slug } });
        if (page) {
            page.title = title || page.title;
            page.content = content || page.content;
            page.bannerImage = bannerImage || page.bannerImage;
            await page.save();
        } else {
            page = await Page.create({
                id: generateMongoId(),
                slug,
                title: title || slug.charAt(0).toUpperCase() + slug.slice(1),
                content: content || {},
                bannerImage: bannerImage || ''
            });
        }
        res.json(page);
    } catch (error) {
        console.error('Update Page Error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadPageImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const { uploadToR2 } = await import('../config/cloudflareR2.js');
        const url = await uploadToR2(req.file.buffer, req.file.originalname, 'pages');
        res.json({ url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
