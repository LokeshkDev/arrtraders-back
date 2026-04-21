import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Category from './models/Category.js';
import Product from './models/Product.js';

const categories = [
  { name: 'Premium Dates', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFdHLpeaw-M2zKY7W7bX88FbQWlphK3HayapwKG8r_QIOcVjZclbQA2z37AlVlmDrWAUv786ANzGsacxTxGTh2Z2hWZC93LqI6LH6u54s_2PS4L4btCJlUtrcEUFIcTLdKJR6zW8k5wqYIW0OQ32KUPmJQG5DiWvvTEeiC_Yy8BT7AikIzoHNin5KnLPUF4RP6J_hdu1D_qOt76H9Bcdntdbs1VAzj69SG1mWcD-Wd9-szhMGqOcY6xKR0qoCXkNxZ9JpGbcIOmmJY' },
  { name: 'Exotic Nuts', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0NQ3WQaxTnA7TpcLKNE7rx5XWGPXVuxjsyDt9AWzVBGZlLEGK_lIaWXmbPqUVG9SEqKui-BGQs3JO7W2Mf-Li18OrYGgsbmfoscreJRKq1waYvv3rT3aeTuJXrP3Gx7HhL-OVBCwAfCoBcmJbDeUb1xOc2ftNBYb8o5jugPmIoAp0hNrKc5TokJQEZnhmL4rORs_lmQ_OWCWYM0eBF5yw6sGCrtwIrD4Hh4bXoj3c-2ZxofarkuuxdXZKbYrqH9NrWNA6EpF__rZ' },
  { name: 'Dried Fruits', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtv9kU8b2YNqPlmzr0WDqL826DA4JdFx3PVBDtA-MnCEAnmZHhRGNfZzkwwL4GmLFAFN5eR_SrrWMtJRXkgI9rm4OKm_A5tL14fHHTul64XqtpMd23LHn_tWocp0pMYiaoOW73OzGAZvX62n5Oj_T5BXvGdb81bhUs4ODQGRKRKIp544W8eEToGMnGNsrp3s3x1XJKsoh28FA976Ri9R-ek5Cx8NsqhInRoRoEIxFD_2QyLH-GuKLK5ipHhPyzVDoSOnNxsVAIMl3DrG' },
  { name: 'Confections', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArUofKh6fS616xEImVzqfnRL0kyPde_r5CwqEeD3Gr1HXwu-nMt7k5fpk9TFpCcDmxh-JKOeZks0sItdnorNhiOrZZujKozdYky8f1iv59PcV-4aIaNXjSKJYrpLfTw_XPaUTECXTdZkJP-F-v8RdVFxkQRk8--tB0OCQbKKFYCxCngsQJbkwL9Ntg7rFn1u35U5K-a_Ul-a7FDEcyS-HvEMebioHuP7haDKTc3vDHRzSqKyTsGjfXyhwRlO4uSDiYHUC8U5Vbg9Et' },
  { name: 'Gift Boxes', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDuKLcLYqED7m-2P2-non0VsK_kZdVYDg5Z-6Dsqe1A1l4BT6AOT5d57iInsnx94611qfVwa41CJeqyEl5ABOcXhFINB_8SI9gJngGqc0njeq4Abs2fq9ElxIvVhx-OQ2mKgxMvhHLLBZ9uUrLWSO9S25-k3BQFxoWN6iRPnQyrBAkiilhIyPt9szPj9F0H6Gn5Y_bnfaMrYmCCNdYWa-QsisgjFih39uHqbJE42MLh1aeyD8d_DNAYuya_KLyHYaBAnGhbF5dMDBgx' }
];

const products = [
    { name: 'Stuffed Medjool Selection', description: '500g Box', category: 'Premium Dates', price: 1250, originalPrice: 1599, flashSale: true, discount: 22, stock: 50, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCopY9DQjy5qowICUnb1wTi3aZ-6MkMBvAloJNyQh63QkfsbvNThDBhH34aX1dc3e1KTuTgDuxZAg-KlkRq2PWMx1tRHRWUP3URmPX0z99nKZcNzjlUihR9Y8lioCu4agLkAR4l2LuM43wwIit9202PzxxJOoupEpnyB_IdV6Af9Mg63iOc5B410uQkyUx2RHBJo_3-Nu0tBhTJPZljDeeiPQdAkI4Zft1kcjNXyBVfSyp1uofhelBu-eOtKe4Sy9XxlvFuuFOOB1-r' },
    { name: 'Chilean Walnut Halves', description: '400g Premium Pack', category: 'Exotic Nuts', price: 890, originalPrice: 1100, flashSale: false, discount: 19, stock: 40, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNjUObxPp4qBq8RNYh6S40bnOX2oFonwhekDvU0Aabrgdt8L9ZFhFMKuKAZqhO68R_837wLGnCn35mlm9KuunnUX7xyFjsHpnrqrXhf9wH5PxCcCKr-tZRgqeD7LtHC0q4VYhLidWl8bx8BiF_E7rG9cG97jlNXCw0HaXk55YuOtv6_3VFWZAFm7WVM6DHEdkG2Li9ewiuxIwyoo-y1A_5r7eeqv-ccETpnQBtMhuiPhm4qTHGd-CRKKLF30YTGpffL23i-XPmJFgh' },
    { name: 'Smoked Herb Cashews', description: '250g Glass Jar', category: 'Exotic Nuts', price: 620, originalPrice: 750, flashSale: true, discount: 17, stock: 15, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDviXMBMoZnMcTJcDW9tDg9Imwl03X9hxp06CxdQsMm5gXrzOk7eZSGrBn_03eypZSmNIueF3yZIppiXITazDHvG9g5Cmysti5vRlso6C3fEX51TPfEy_CEIFIPoPamwK-uA8tdWlmPQw3YIeEVfKaESa3tK1wloXU3utWnpT14qUi3b2MuV4Ff4waB0GfnIdI1z46rhQRRgYouQUFkIanJJpXSwPURQLQ87oh9g8uH-DhWt6fgTdm2csqDO3jAKap8bvTWyUaWuFl5' },
    { name: 'Kashmiri Mongra Saffron', description: '1g Luxury Box', category: 'Confections', price: 480, originalPrice: 599, flashSale: false, discount: 20, stock: 200, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCSTm8T64ISMuiZTO31wVe7cMXYx3LGroM26TpnDVQrW_6C-XpSi6l2yVb0U57h4wVhezXG7ZS4Q3esFFSu31cnOOOrm5yNes0UJga_wDhX8BfTlcuy42gnuq_31PKYyY0-HuHKCZDrhlJcD6o_ZUZVebtVPlwHleqUkXX-I6Biww0XQopXPbyYRKfGFeUWVADhUMiVIY26laeLLToj6R9qwVePvOdd7MfBlbS_xvioohs0ieDX5ZhYgVdy4Fs9nTnszxHjekEK-Y9' },
    { name: 'Wild Forest Honey', description: '200g Organic', category: 'Confections', isTopRated: true, price: 480, originalPrice: 540, stock: 45, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa0NQ3WQaxTnA7TpcLKNE7rx5XWGPXVuxjsyDt9AWzVBGZlLEGK_lIaWXmbPqUVG9SEqKui-BGQs3JO7W2Mf-Li18OrYGgsbmfoscreJRKq1waYvv3rT3aeTuJXrP3Gx7HhL-OVBCwAfCoBcmJbDeUb1xOc2ftNBYb8o5jugPmIoAp0hNrKc5TokJQEZnhmL4rORs_lmQ_OWCWYM0eBF5yw6sGCrtwIrD4Hh4bXoj3c-2ZxofarkuuxdXZKbYrqH9NrWNA6EpF__rZ' }
];

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
    console.log('MongoDB Connected');
    
    await Category.deleteMany();
    await Product.deleteMany();

    const createdCats = await Category.insertMany(categories.map(c => ({ name: c.name, image: c.img })));
    console.log(`${createdCats.length} Categories seeded!`);

    const createdProds = await Product.insertMany(products);
    console.log(`${createdProds.length} Products seeded!`);
    
    process.exit(0);
})
.catch((error) => {
    console.error('Error with seed:', error);
    process.exit(1);
});
