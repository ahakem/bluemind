import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️  Starting build process...');

// Files to preserve in docs folder
const preserveFiles = ['CNAME', 'robots.txt', 'sitemap.xml', '404.html'];
const docsDir = './docs';
const backupDir = './.build-backup';

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

// Backup important files
console.log('💾 Backing up important files...');
preserveFiles.forEach(file => {
  const srcPath = path.join(docsDir, file);
  const backupPath = path.join(backupDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, backupPath);
    console.log(`✅ Backed up ${file}`);
  } else {
    console.log(`ℹ️  ${file} not found, skipping`);
  }
});

// Clean old build files (but not preserved files)
console.log('🧹 Cleaning old build files...');
try {
  if (fs.existsSync(path.join(docsDir, 'index.html'))) {
    fs.unlinkSync(path.join(docsDir, 'index.html'));
  }
  if (fs.existsSync(path.join(docsDir, 'index.js'))) {
    fs.unlinkSync(path.join(docsDir, 'index.js'));
  }
  
  // Clean assets folder but recreate it
  const assetsDir = path.join(docsDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true, force: true });
  }
  console.log('✅ Cleaned old build files');
} catch (error) {
  console.log('ℹ️  No old build files to clean');
}

// Run Vite build
console.log('⚛️  Building React app...');
try {
  execSync('vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    stdio: 'inherit' 
  });
  console.log('✅ Vite build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Run react-snap for pre-rendering
console.log('📄 Pre-rendering pages...');
try {
  execSync('react-snap', { stdio: 'inherit' });
  console.log('✅ Pre-rendering completed');
} catch (error) {
  console.log('⚠️  Pre-rendering failed, continuing without it:', error.message);
}

// Restore important files
console.log('🔄 Restoring important files...');
preserveFiles.forEach(file => {
  const backupPath = path.join(backupDir, file);
  const destPath = path.join(docsDir, file);
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, destPath);
    console.log(`✅ Restored ${file}`);
  }
});

// Clean up backup directory
try {
  fs.rmSync(backupDir, { recursive: true, force: true });
  console.log('🧹 Cleaned up backup files');
} catch (error) {
  console.log('ℹ️  No backup files to clean');
}

console.log('');
console.log('🎉 Build complete!');
console.log('📁 Files are ready in docs/ folder');
console.log('📄 Preserved files: CNAME, robots.txt, sitemap.xml, 404.html');
console.log('🚀 Run "npm run deploy" to deploy to GitHub Pages');
console.log('');