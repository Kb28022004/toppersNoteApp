const { convertPdfToImages } = require("./src/utils/pdfToImages");
const fs = require('fs');
const path = require('path');
async function test() {
  const testDir = './test-output';
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir);
  const pdfsDir = './uploads/pdfs';
  if (fs.existsSync(pdfsDir)) {
      const files = fs.readdirSync(pdfsDir).filter(f => f.endsWith('.pdf'));
      if (files.length > 0) {
          const pdfPath = path.join(pdfsDir, files[0]);
          console.log('Testing with', pdfPath);
          const imgs = await convertPdfToImages(pdfPath, testDir, 'test1');
          console.log('Got images length:', imgs.length);
      } else {
          console.log("No pdfs found");
      }
  } else {
      console.log("No directory");
  }
}
test();
