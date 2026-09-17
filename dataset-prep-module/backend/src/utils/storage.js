const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'storage', 'uploads');
const PREPARED_DIR = path.join(__dirname, '..', '..', 'storage', 'prepared');

[UPLOADS_DIR, PREPARED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function readOriginalData(fileName) {
  const filePath = path.join(UPLOADS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset source file not found: ${fileName}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function readPreparedData(fileName) {
  const filePath = path.join(PREPARED_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Prepared version file not found: ${fileName}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writePreparedData(fileName, data) {
  const filePath = path.join(PREPARED_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

/**
 * Resolve the row-data for a given dataset version.
 * version_number 1 (Original) always reads from the dataset's source file.
 * Any later version reads from its own prepared JSON snapshot.
 */
function resolveVersionData(dataset, version) {
  if (!version || version.version_number === 1) {
    return readOriginalData(dataset.data_path);
  }
  return readPreparedData(version.data_path);
}

module.exports = {
  UPLOADS_DIR,
  PREPARED_DIR,
  readOriginalData,
  readPreparedData,
  writePreparedData,
  resolveVersionData
};
