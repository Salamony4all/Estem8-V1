#!/usr/bin/env node

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Check command arguments
const filePath = process.argv[2];
const useChartRecognition = process.argv[3] === '--chart' || process.argv[3] === '-c';

if (!filePath) {
  log('Usage: node test-paddleocr.js <file_path> [--chart]', colors.yellow);
  log('', colors.reset);
  log('Arguments:', colors.cyan);
  log('  <file_path>  Path to the document (PDF or image)', colors.reset);
  log('  --chart, -c  Enable chart recognition (optional)', colors.reset);
  log('', colors.reset);
  log('Example:', colors.cyan);
  log('  node scripts/test-paddleocr.js /path/to/document.pdf', colors.reset);
  log('  node scripts/test-paddleocr.js /path/to/image.jpg --chart', colors.reset);
  process.exit(1);
}

// Verify file exists
if (!fs.existsSync(filePath)) {
  log(`Error: File not found: ${filePath}`, colors.red);
  process.exit(1);
}

async function testPaddleOCR() {
  const formData = new FormData();
  formData.append('file_path', fs.createReadStream(filePath));
  formData.append('use_chart_recognition', useChartRecognition ? 'true' : 'false');

  try {
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
    log('PaddleOCR API Test', colors.cyan);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
    log('');
    
    const apiUrl = process.env.NEXT_PUBLIC_PADDLEOCR_API_URL || 
                   'https://app-u613z0mda075e806.aistudio-app.com/handle_complex_doc';
    
    log(`File: ${path.basename(filePath)}`, colors.blue);
    log(`Size: ${(fs.statSync(filePath).size / 1024).toFixed(2)} KB`, colors.blue);
    log(`Chart Recognition: ${useChartRecognition ? 'Enabled' : 'Disabled'}`, colors.blue);
    log(`API URL: ${apiUrl}`, colors.blue);
    log('');
    log('Sending document to PaddleOCR API...', colors.yellow);
    
    const startTime = Date.now();
    
    const response = await axios.post(apiUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 120000, // 2 minute timeout
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log('');
    log(`✓ Response received in ${duration}s`, colors.green);
    log('');

    if (Array.isArray(response.data) && response.data.length >= 3) {
      const [markdown, visualizationHtml, sourceCode] = response.data;
      
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
      log('✓ SUCCESS - API call completed successfully!', colors.green);
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.green);
      log('');

      // Create output directory
      const outputDir = path.join(process.cwd(), 'paddleocr-output');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Save results to files with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const baseName = path.basename(filePath, path.extname(filePath));
      
      const markdownPath = path.join(outputDir, `${baseName}_${timestamp}.md`);
      const htmlPath = path.join(outputDir, `${baseName}_${timestamp}_viz.html`);
      const sourcePath = path.join(outputDir, `${baseName}_${timestamp}_source.md`);
      
      fs.writeFileSync(markdownPath, markdown);
      fs.writeFileSync(htmlPath, visualizationHtml);
      fs.writeFileSync(sourcePath, sourceCode);

      log('Results saved:', colors.cyan);
      log(`  📄 Markdown:      ${markdownPath}`, colors.reset);
      log(`  🎨 Visualization: ${htmlPath}`, colors.reset);
      log(`  📝 Source:        ${sourcePath}`, colors.reset);
      log('');

      // Display preview
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
      log('Preview of Extracted Text (first 1000 characters):', colors.cyan);
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
      log('');
      
      const preview = markdown.substring(0, 1000);
      log(preview, colors.reset);
      
      if (markdown.length > 1000) {
        log('', colors.reset);
        log(`... (${markdown.length - 1000} more characters)`, colors.yellow);
      }
      
      log('');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
      log('Statistics:', colors.cyan);
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
      log(`  Total characters: ${markdown.length}`, colors.reset);
      log(`  Total lines:      ${markdown.split('\n').length}`, colors.reset);
      log(`  Processing time:  ${duration}s`, colors.reset);
      log('');
      
      // Open visualization in browser (optional)
      log('To view the visualization, open:', colors.yellow);
      log(`  ${htmlPath}`, colors.cyan);
      log('');
      
    } else {
      log('✗ Unexpected response format', colors.red);
      log('Response:', colors.yellow);
      console.log(response.data);
    }
  } catch (error) {
    log('');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('✗ ERROR - Failed to connect to PaddleOCR API', colors.red);
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.red);
    log('');
    
    if (error.response) {
      log(`Status: ${error.response.status}`, colors.red);
      log('Response data:', colors.yellow);
      console.log(error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      log('Connection refused. Make sure the API is accessible.', colors.red);
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
      log('Request timed out. The document may be too large or the service is slow.', colors.red);
    } else {
      log(error.message, colors.red);
    }
    
    log('');
    process.exit(1);
  }
}

testPaddleOCR();
