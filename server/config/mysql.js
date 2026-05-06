import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'arr_rahman',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
        timestamps: true // adds createdAt and updatedAt
    }
  }
);

export const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected Successfully to database: ${sequelize.config.database}`);
    
    await sequelize.sync({ alter: false });
    console.log('Database schema synchronized');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
    process.exit(1);
  }
};

export default sequelize;
