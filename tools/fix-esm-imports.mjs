import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const libDir = path.join(__dirname, '../lib');

function fixImports(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      fixImports(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Fix relative imports - add .js extension
      // Match: from "./path" or from "../path" or from "../../path" etc
      // But not: from "package-name" or from "@scope/package"
      const importRegex = /(from\s+["'])(\.[^"']+)(["'])/g;
      content = content.replace(importRegex, (match, p1, p2, p3) => {
        // Skip if already has an extension
        if (p2.match(/\.(js|mjs|json)$/)) {
          return match;
        }
        modified = true;
        return `${p1}${p2}.js${p3}`;
      });
      
      // Fix dynamic imports too: import("./path")
      const dynamicImportRegex = /(import\s*\(\s*["'])(\.[^"']+)(["']\s*\))/g;
      content = content.replace(dynamicImportRegex, (match, p1, p2, p3) => {
        if (p2.match(/\.(js|mjs|json)$/)) {
          return match;
        }
        modified = true;
        return `${p1}${p2}.js${p3}`;
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  }
}

console.log('Fixing ESM imports in lib directory...');
fixImports(libDir);
console.log('Done!');
