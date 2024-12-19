import fs from 'fs';
import { parse } from 'csv-parse';
import { createTable, insertData } from './db';
import { generateEmbedding } from './embeddings';

async function importCsvData(filePath: string) {
  await createTable();

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', async (row) => {
      const data = `{question: ${row.question}, answer: ${row.answer}, category: ${row.category}}`;
      const metadata = { "category": row.category, "created_at": new Date().toISOString()};
      const embedding = await generateEmbedding(data);
      await insertData(metadata, data, JSON.stringify(embedding));
    })
    .on('end', () => {
      console.log('CSV data imported successfully');
    });

}

// Usage: node -r ts-node/register src/importCsv.ts path/to/your/csv/file.csv
const csvFilePath = process.argv[2];
if (!csvFilePath) {
  console.error('Please provide a CSV file path');
  process.exit(1);
}

importCsvData(csvFilePath);
