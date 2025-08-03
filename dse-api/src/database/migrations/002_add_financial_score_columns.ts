import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Adding financial score columns...');

  // Add only the financial score columns (other columns seem to already exist)
  try {
    await db.schema
      .alterTable('companies')
      .addColumn('financial_score', sql`decimal(5,2)`)
      .execute();
    console.log('✅ Added financial_score column');
  } catch (error) {
    if ((error as any).code === '42701') {
      console.log('⚠️  financial_score column already exists');
    } else {
      throw error;
    }
  }

  try {
    await db.schema
      .alterTable('companies')
      .addColumn('financial_score_components', 'text')
      .execute();
    console.log('✅ Added financial_score_components column');
  } catch (error) {
    if ((error as any).code === '42701') {
      console.log('⚠️  financial_score_components column already exists');
    } else {
      throw error;
    }
  }

  try {
    await db.schema
      .alterTable('companies')
      .addColumn('financial_score_calculated_at', 'timestamp')
      .execute();
    console.log('✅ Added financial_score_calculated_at column');
  } catch (error) {
    if ((error as any).code === '42701') {
      console.log('⚠️  financial_score_calculated_at column already exists');
    } else {
      throw error;
    }
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the added columns
  await db.schema
    .alterTable('companies')
    .dropColumn('listing_year')
    .dropColumn('market_category')
    .dropColumn('unaudited_pe_ratio')
    .dropColumn('financial_score')
    .dropColumn('financial_score_components')
    .dropColumn('financial_score_calculated_at')
    .execute();
}
