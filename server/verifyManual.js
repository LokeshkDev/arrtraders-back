import bcrypt from 'bcryptjs';

const check = async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    const match = await bcrypt.compare('admin123', hash);
    console.log(`Password: "admin123", Match: ${match}`);
    process.exit();
};
check();
