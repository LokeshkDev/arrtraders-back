import mongoose from 'mongoose';

const homePageSchema = mongoose.Schema({
    heroSlides: [{
        title: { type: String, default: 'Premium <span>Dates</span> from Saudi Arabia' },
        subtitle: { type: String, default: 'ORGANICO FOODS' },
        text: { type: String, default: 'Experience the authentic taste of tradition with our hand-picked selection of estate-reserve dates.' },
        productImg: { type: String, default: '/images/reference/product-large-1.jpg' },
        bgImg: { type: String, default: '/images/reference/banner-1.jpg' },
        btnText: { type: String, default: 'Shop Collection' },
        btnLink: { type: String, default: '/categories' }
    }],
    featuredBtnText: { type: String, default: 'Visit Now' },
    featuredBtnLink: { type: String, default: '/featured' },
    bestSellersBtnText: { type: String, default: 'Explore All Catalog' },
    bestSellersBtnLink: { type: String, default: '/best-sellers' },
    features: [{
        title: { type: String },
        desc: { type: String },
        icon: { type: String, default: 'ShieldCheck' }
    }],
    categoryItems: [{
        name: { type: String },
        img: { type: String },
        count: { type: String }
    }],
    experienceBanners: [{
        title: { type: String },
        text: { type: String },
        img: { type: String },
        btnText: { type: String, default: 'Explore' },
        btnLink: { type: String, default: '/categories' },
        btnStyle: { type: String, default: 'primary' }
    }],
    promos: [{
        discount: String,
        title: String,
        subtitle: String,
        img: String,
        bg: String,
        accentColor: String,
        link: { type: String, default: '/categories' }
    }],
    heritage: {
        title: { type: String, default: 'From the Heart of the Oasis' },
        subtitle: { type: String, default: 'Our Heritage' },
        description: { type: String, default: 'Founded on the principles of purity and provenance.' },
        image: { type: String, default: '' },
        stats: [{
            value: String,
            label: String
        }]
    },
    couponBanners: {
        cashbackPromo: { type: String, default: 'Get ₹3 Cashback! Min Order of ₹30' },
        couponCode: { type: String, default: 'ARRAHMAN2026' },
        leftBanner: {
            title: { type: String, default: 'Get Ready To <span style="color: #27ae60">TAKE ON THE DAY!</span>' },
            subtitle: { type: String, default: 'It\'s your shopping experience redefined' },
            image: { type: String, default: '' },
            link: { type: String, default: '/categories' }
        },
        rightBanner: {
            title: { type: String, default: '20% Off' },
            subtitle: { type: String, default: 'SHIMMERY Product' },
            link: { type: String, default: '/categories' }
        }
    },
    shippingInfo: {
        title: { type: String, default: 'Shipping & Delivery' },
        content: { type: String, default: 'We ship all orders within 24-48 hours of placement. Standard delivery takes 3-5 business days. Free shipping on orders above ₹500.' },
        deliveryTime: { type: String, default: '3-5 Business Days' },
        freeShippingMin: { type: String, default: '₹500' },
        returnPolicy: { type: String, default: '7-day easy returns on all products.' }
    },
    testimonials: [{
        name: String,
        role: String,
        text: String,
        img: String,
        rating: { type: Number, default: 5 }
    }],
    showHero: { type: Boolean, default: true },
    showFeatures: { type: Boolean, default: true },
    showCategories: { type: Boolean, default: true },
    showBestSellers: { type: Boolean, default: true },
    showFeatured: { type: Boolean, default: true },
    showFlashSale: { type: Boolean, default: true },
    showExperience: { type: Boolean, default: true },
    showTestimonials: { type: Boolean, default: true },
    flashSaleEndTime: { type: Date }
}, { timestamps: true });

const HomePage = mongoose.model('HomePage', homePageSchema);
export default HomePage;
