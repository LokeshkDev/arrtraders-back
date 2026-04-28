import { DeliveryZone } from '../models/sql/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/mysql.js';

const generateId = () => {
    return Math.floor(Date.now() / 1000).toString(16) + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

const normalizeOptionalNumber = (value) => {
    if (value === '' || value === undefined || value === null) return null;
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? null : numericValue;
};

const normalizeRequiredNumber = (value, fallback) => {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? fallback : numericValue;
};

const STATE_PINCODE_RANGES = [
    {
        names: ['tn', 'tamil nadu', 'tamilnadu'],
        values: ['Tamil Nadu', 'TN', 'Tamilnadu'],
        min: 600000,
        max: 643999
    },
    {
        names: ['ka', 'karnataka'],
        values: ['Karnataka', 'KA'],
        min: 560000,
        max: 591999
    },
    {
        names: ['ts', 'tg', 'telangana'],
        values: ['Telangana', 'TS', 'TG'],
        min: 500000,
        max: 509999
    },
    {
        names: ['ap', 'andhra pradesh', 'andhrapradesh'],
        values: ['Andhra Pradesh', 'AP', 'Andhrapradesh'],
        min: 515000,
        max: 535999
    }
];

const CITY_ALIASES = {
    bangalore: ['Bangalore', 'Bengaluru', 'Bengaluru Urban', 'Bangalore Urban'],
    bengaluru: ['Bangalore', 'Bengaluru', 'Bengaluru Urban', 'Bangalore Urban'],
    'bengaluru urban': ['Bangalore', 'Bengaluru', 'Bengaluru Urban', 'Bangalore Urban'],
    hyderabad: ['Hyderabad', 'Secunderabad'],
    secunderabad: ['Hyderabad', 'Secunderabad']
};

const getCityLookupValues = (city) => {
    if (!city) return [];
    const normalizedCity = String(city).trim().toLowerCase();
    return CITY_ALIASES[normalizedCity] || [String(city).trim()];
};

const getStateLookupValues = ({ pincode, state }) => {
    const values = new Set();
    const normalizedState = state ? String(state).trim().toLowerCase() : '';
    const pincodeNumber = Number(String(pincode || '').trim());

    if (state) values.add(String(state).trim());

    STATE_PINCODE_RANGES.forEach((stateConfig) => {
        const matchesStateName = normalizedState && stateConfig.names.includes(normalizedState);
        const matchesPincode = !Number.isNaN(pincodeNumber) && pincodeNumber >= stateConfig.min && pincodeNumber <= stateConfig.max;

        if (matchesStateName || matchesPincode) {
            stateConfig.values.forEach((value) => values.add(value));
        }
    });

    values.add('India');

    return [...values];
};

// --- USER ACTIONS ---

// Validate a pincode and return delivery details
export const validateLocation = async (req, res) => {
    try {
        const { pincode, city, state } = req.body;

        if (!pincode) {
            return res.status(400).json({ message: 'Pincode is required' });
        }

        const stateLookupValues = getStateLookupValues({ pincode, state });
        const cityLookupValues = getCityLookupValues(city);

        // Try to match in order of specificity: Pincode -> City -> State -> India default.
        // We look for active zones that match any of these
        const zones = await DeliveryZone.findAll({
            where: {
                isActive: true,
                [Op.or]: [
                    { type: 'Pincode', value: String(pincode).trim() },
                    cityLookupValues.length ? { type: 'City', value: { [Op.in]: cityLookupValues } } : null,
                    stateLookupValues.length ? { type: 'State', value: { [Op.in]: stateLookupValues } } : null
                ].filter(Boolean)
            },
            order: [
                sequelize.literal("CASE WHEN type = 'Pincode' THEN 1 WHEN type = 'City' THEN 2 WHEN value = 'India' THEN 4 ELSE 3 END")
            ]
        });

        if (zones.length === 0) {
            return res.status(200).json({ 
                serviceable: false, 
                message: 'Sorry, we do not deliver to this location yet.' 
            });
        }

        const bestMatch = zones[0];
        res.json({
            serviceable: true,
            deliveryCharge: bestMatch.deliveryCharge,
            minOrderForFreeDelivery: bestMatch.minOrderForFreeDelivery,
            estimatedDeliveryDays: bestMatch.estimatedDeliveryDays,
            zone: bestMatch.name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all serviceable areas (for suggestions/manual select)
export const getServiceableAreas = async (req, res) => {
    try {
        const areas = await DeliveryZone.findAll({
            where: { isActive: true },
            attributes: ['type', 'value', 'name']
        });
        res.json(areas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- ADMIN ACTIONS ---

export const getZones = async (req, res) => {
    try {
        const zones = await DeliveryZone.findAll();
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createZone = async (req, res) => {
    try {
        const { name, type, value, deliveryCharge, minOrderForFreeDelivery, estimatedDeliveryDays, isActive } = req.body;

        if (!name || !type || !value) {
            return res.status(400).json({ message: 'Name, type, and value are required' });
        }
        
        const zone = await DeliveryZone.create({
            id: generateId(),
            name,
            type,
            value: String(value).trim(),
            deliveryCharge: normalizeRequiredNumber(deliveryCharge, 50),
            minOrderForFreeDelivery: normalizeOptionalNumber(minOrderForFreeDelivery),
            estimatedDeliveryDays: estimatedDeliveryDays || '2-4 Days',
            isActive: isActive !== undefined ? isActive : true
        });
        
        res.status(201).json(zone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateZone = async (req, res) => {
    try {
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });

        const updates = { ...req.body };
        if (updates.value !== undefined) updates.value = String(updates.value).trim();
        if (updates.deliveryCharge !== undefined) updates.deliveryCharge = normalizeRequiredNumber(updates.deliveryCharge, zone.deliveryCharge);
        if (updates.minOrderForFreeDelivery !== undefined) updates.minOrderForFreeDelivery = normalizeOptionalNumber(updates.minOrderForFreeDelivery);
        if (!updates.estimatedDeliveryDays) updates.estimatedDeliveryDays = '2-4 Days';

        await zone.update(updates);
        res.json(zone);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteZone = async (req, res) => {
    try {
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: 'Zone not found' });

        await zone.destroy();
        res.json({ message: 'Zone removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Quick pincode check (lightweight, for address form validation)
export const checkPincode = async (req, res) => {
    try {
        const pincode = String(req.params.pincode || '').trim();

        if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ serviceable: false, message: 'Please enter a valid 6-digit pincode' });
        }

        const stateLookupValues = getStateLookupValues({ pincode });

        const zones = await DeliveryZone.findAll({
            where: {
                isActive: true,
                [Op.or]: [
                    { type: 'Pincode', value: pincode },
                    stateLookupValues.length ? { type: 'State', value: { [Op.in]: stateLookupValues } } : null
                ].filter(Boolean)
            },
            order: [
                sequelize.literal("CASE WHEN type = 'Pincode' THEN 1 WHEN type = 'City' THEN 2 WHEN value = 'India' THEN 4 ELSE 3 END")
            ]
        });

        if (zones.length === 0) {
            return res.json({
                serviceable: false,
                message: 'Sorry, we do not deliver to this pincode yet.'
            });
        }

        const bestMatch = zones[0];
        res.json({
            serviceable: true,
            deliveryCharge: bestMatch.deliveryCharge,
            estimatedDeliveryDays: bestMatch.estimatedDeliveryDays,
            zone: bestMatch.name
        });
    } catch (error) {
        res.status(500).json({ serviceable: false, message: error.message });
    }
};

export const bulkUploadPincodes = async (req, res) => {
    try {
        const { pincodes, name, deliveryCharge } = req.body; // Array of pincodes
        if (!Array.isArray(pincodes)) return res.status(400).json({ message: 'Invalid data format' });

        const zones = pincodes.map(p => ({
            id: generateId(),
            name: name || `Zone ${p}`,
            type: 'Pincode',
            value: String(p).trim(),
            deliveryCharge: normalizeRequiredNumber(deliveryCharge, 50),
            isActive: true
        }));

        await DeliveryZone.bulkCreate(zones);
        res.status(201).json({ message: `${zones.length} pincodes added successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
