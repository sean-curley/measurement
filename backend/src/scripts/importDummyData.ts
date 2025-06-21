import { importMetricCsv } from '../services/data-point.service';
import path from 'path';


const run = async () => {
  try {
    const metricId = 1; // replace with your desired metric ID
    const filePaths = [
      path.resolve(__dirname, '/Users/seanc/Downloads/habitual 2025 - Sheet1.csv'),
    ];

    for (const filePath of filePaths) {
      console.log(`Importing from: ${filePath}`);
      await importMetricCsv(filePath,2025, metricId);
    }

    console.log('Import completed.');
  } catch (err) {
    console.error('Error during import:', err);
  }
};



run();
