import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rnRoot = path.resolve(__dirname, '..');
const webRoot = path.resolve(rnRoot, '..');
const distDir = path.join(webRoot, 'dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('Error: dist/ directory not found. Run "npm run build" in the root directory first.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));

const cssContent = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';
const jsContent = jsFile ? fs.readFileSync(path.join(assetsDir, jsFile), 'utf8') : '';

// Escape closing script tags safely for inline embedding
const safeJsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');

const inlineHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#020617" />
    <title>Crown of Emeraldia</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Press+Start+2P&display=swap" rel="stylesheet" />
    <style>${cssContent}</style>
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950">
    <div id="root"></div>
    <script type="module">${safeJsContent}</script>
  </body>
</html>`;

const outHtmlPath = path.join(rnRoot, 'assets', 'game-bundle.html');
fs.mkdirSync(path.dirname(outHtmlPath), { recursive: true });
fs.writeFileSync(outHtmlPath, inlineHtml, 'utf8');

const outTsPath = path.join(rnRoot, 'src', 'bundle', 'inlineGameHtml.ts');
fs.mkdirSync(path.dirname(outTsPath), { recursive: true });
fs.writeFileSync(
  outTsPath,
  `// Auto-generated standalone 60FPS HTML5 Canvas bundle for Expo React Native\nexport const INLINE_GAME_HTML: string = ${JSON.stringify(inlineHtml)};\n`,
  'utf8'
);

console.log('Successfully generated offline standalone Expo bundle:', outHtmlPath, 'and', outTsPath);
