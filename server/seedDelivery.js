import { DeliveryZone } from './models/sql/index.js';
import sequelize from './config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

const generateId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

const seedDefaults = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Ensure tables are created
        
        // Check if Tamil Nadu zone exists
        const exists = await DeliveryZone.findOne({ where: { value: 'Tamil Nadu', type: 'State' } });
        
        if (!exists) {
            await DeliveryZone.create({
                id: generateId(),
                name: 'Tamil Nadu Default',
                type: 'State',
                value: 'Tamil Nadu',
                deliveryCharge: 50,
                isActive: true,
                estimatedDeliveryDays: '2-3 Days'
            });
            console.log('Default Tamil Nadu delivery zone created.');
        } else {
            console.log('Tamil Nadu delivery zone already exists.');
        }

        const indiaExists = await DeliveryZone.findOne({ where: { value: 'India', type: 'State' } });

        if (!indiaExists) {
            await DeliveryZone.create({
                id: generateId(),
                name: 'All India Delivery',
                type: 'State',
                value: 'India',
                deliveryCharge: 120,
                isActive: true,
                estimatedDeliveryDays: '4-7 Days'
            });
            console.log('Default All India delivery zone created.');
        } else {
            console.log('All India delivery zone already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDefaults();
