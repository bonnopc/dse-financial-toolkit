import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Create companies table
  await db.schema
    .createTable('companies')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('code', 'varchar(10)', (col) => col.notNull().unique())
    .addColumn('full_name', 'varchar(255)')
    .addColumn('sector', 'varchar(100)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create dividends table
  await db.schema
    .createTable('dividends')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('company_id', 'integer', (col) =>
      col.references('companies.id').onDelete('cascade').notNull()
    )
    .addColumn('year', 'integer', (col) => col.notNull())
    .addColumn('cash_dividend', sql`decimal(10,2)`, (col) => col.defaultTo(0))
    .addColumn('stock_dividend', sql`decimal(10,2)`, (col) => col.defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create company_loans table
  await db.schema
    .createTable('company_loans')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('company_id', 'integer', (col) =>
      col.references('companies.id').onDelete('cascade').notNull()
    )
    .addColumn('short_term_million', sql`decimal(12,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('long_term_million', sql`decimal(12,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('date_updated', 'varchar(50)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create company_reserves table
  await db.schema
    .createTable('company_reserves')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('company_id', 'integer', (col) =>
      col.references('companies.id').onDelete('cascade').notNull()
    )
    .addColumn('reserve_million', sql`decimal(12,2)`, (col) => col.defaultTo(0))
    .addColumn('unappropriated_profit_million', sql`decimal(12,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('date_updated', 'varchar(50)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create company_metadata table
  await db.schema
    .createTable('company_metadata')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('company_id', 'integer', (col) =>
      col.references('companies.id').onDelete('cascade').notNull()
    )
    .addColumn('authorized_capital_million', sql`decimal(12,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('paid_up_capital_million', sql`decimal(12,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('share_count', 'bigint', (col) => col.defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create financial_performance table
  await db.schema
    .createTable('financial_performance')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('company_id', 'integer', (col) =>
      col.references('companies.id').onDelete('cascade').notNull()
    )
    .addColumn('year', 'integer', (col) => col.notNull())
    .addColumn('earnings_per_share', sql`decimal(10,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('net_operating_cash_flow_per_share', sql`decimal(10,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('net_asset_value_per_share', sql`decimal(10,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create price_info table
  await db.schema
    .createTable('price_info')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('company_id', 'integer', (col) =>
      col.references('companies.id').onDelete('cascade').notNull()
    )
    .addColumn('last_trading_price', sql`decimal(10,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('change_amount', sql`decimal(10,2)`, (col) => col.defaultTo(0))
    .addColumn('change_percentage', sql`decimal(10,2)`, (col) =>
      col.defaultTo(0)
    )
    .addColumn('volume', 'bigint', (col) => col.defaultTo(0))
    .addColumn('value_million', sql`decimal(12,2)`, (col) => col.defaultTo(0))
    .addColumn('trade_count', 'integer', (col) => col.defaultTo(0))
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute();

  // Create indexes if they don't exist
  try {
    await db.schema
      .createIndex('idx_companies_code')
      .ifNotExists()
      .on('companies')
      .column('code')
      .execute();

    await db.schema
      .createIndex('idx_dividends_company_year')
      .ifNotExists()
      .on('dividends')
      .columns(['company_id', 'year'])
      .execute();

    await db.schema
      .createIndex('idx_companies_sector')
      .ifNotExists()
      .on('companies')
      .column('sector')
      .execute();
  } catch (error) {
    console.log('Some indexes already exist, skipping...');
  }

  console.log('✅ Database tables created successfully');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('price_info').execute();
  await db.schema.dropTable('financial_performance').execute();
  await db.schema.dropTable('company_metadata').execute();
  await db.schema.dropTable('company_reserves').execute();
  await db.schema.dropTable('company_loans').execute();
  await db.schema.dropTable('dividends').execute();
  await db.schema.dropTable('companies').execute();

  console.log('✅ Database tables dropped successfully');
}
