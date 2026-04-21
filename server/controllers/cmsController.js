import Category from '../models/Category.js';
import News from '../models/News.js';
import Gallery from '../models/Gallery.js';
import HomePage from '../models/HomePage.js';

// --- CATEGORIES ---
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description, parent } = req.body;
        let image = req.body.image;
        
        if (req.file) {
            const { uploadToR2 } = await import('../config/cloudflareR2.js');
            image = await uploadToR2(req.file.buffer, req.file.originalname, 'category');
        }

        const category = new Category({ 
            name, 
            description, 
            image,
            parent: parent || null 
        });
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (category) {
            category.name = req.body.name || category.name;
            category.description = req.body.description || category.description;
            category.parent = req.body.parent === '' ? null : (req.body.parent || category.parent);
            if (req.file) {
                const { uploadToR2 } = await import('../config/cloudflareR2.js');
                category.image = await uploadToR2(req.file.buffer, req.file.originalname, 'category');
            }
            const updatedCategory = await category.save();
            res.json(updatedCategory);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- NEWS ---
export const getNews = async (req, res) => {
    try {
        const news = await News.find({}).sort({ date: -1 });
        res.json(news);
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

        const news = new News({ title, content, author, category, image });
        const createdNews = await news.save();
        res.status(201).json(createdNews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- GALLERY ---
export const getGallery = async (req, res) => {
    try {
        const gallery = await Gallery.find({});
        res.json(gallery);
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

        const gallery = new Gallery({ title, description, category, image });
        const createdGallery = await gallery.save();
        res.status(201).json(createdGallery);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- DELETE HANDLERS ---
export const deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteNews = async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'News removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGallery = async (req, res) => {
    try {
        await Gallery.findByIdAndDelete(req.params.id);
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
            homepage = await HomePage.create({});
        }
        res.json(homepage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateHomePageCMS = async (req, res) => {
    try {
        let homepage = await HomePage.findOne({});
        if (!homepage) {
            homepage = new HomePage();
        }
        
        homepage.hero = req.body.hero || homepage.hero;
        homepage.promos = req.body.promos || homepage.promos;
        homepage.heritage = req.body.heritage || homepage.heritage;
        homepage.couponBanners = req.body.couponBanners || homepage.couponBanners;
        homepage.heroSlides = req.body.heroSlides || homepage.heroSlides;
        homepage.features = req.body.features || homepage.features;
        homepage.categoryItems = req.body.categoryItems || homepage.categoryItems;
        homepage.experienceBanners = req.body.experienceBanners || homepage.experienceBanners;
        homepage.testimonials = req.body.testimonials || homepage.testimonials;
        if (req.body.shippingInfo) {
            homepage.shippingInfo = req.body.shippingInfo;
        }

        // Handle visibility flags
        ['showHero', 'showFeatures', 'showCategories', 'showBestSellers', 'showFeatured', 'showFlashSale', 'showExperience', 'showTestimonials', 'flashSaleEndTime'].forEach(f => {
            if (req.body[f] !== undefined) {
                homepage[f] = req.body[f];
            }
        });
        
        const updatedHomePage = await homepage.save();
        res.json(updatedHomePage);
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
