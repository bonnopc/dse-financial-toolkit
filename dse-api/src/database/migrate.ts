import { ConfigService } from '@nestjs/config';
import dotenv from 'dotenv';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { up } from './migrations/001_initial_schema';
import { up as up002 } from './migrations/002_add_financial_score_columns';
import { Database } from './schema';

// Load environment variables
dotenv.config();

async function migrate() {
  const configService = new ConfigService();
  
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'bonnopc',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dse_financial_db',
  });

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  try {
    console.log('🔄 Running database migrations...');
    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      database: process.env.DB_NAME
    });
    await up(db);
    console.log('✅ Initial schema migration completed');
    await up002(db);
    console.log('✅ Financial score columns migration completed');
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

if (require.main === module) {
  migrate();
}
