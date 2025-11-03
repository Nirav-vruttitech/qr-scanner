import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const buildDir = path.resolve("dist");
const finalDir = path.resolve("final");

// 1️⃣ Run vite build
console.log("🛠️  Building project...");
execSync("npm run build", { stdio: "inherit" });

// 2️⃣ Create and clean final folder
if (fs.existsSync(finalDir)) {
  // Clean existing files
  const existingFiles = fs.readdirSync(finalDir);
  existingFiles.forEach((file) => {
    fs.unlinkSync(path.join(finalDir, file));
  });
} else {
  fs.mkdirSync(finalDir);
}

// 3️⃣ Find built files
const htmlFile = path.join(buildDir, "index.html");
const assetsDir = path.join(buildDir, "assets");
const assetFiles = fs.readdirSync(assetsDir);

// Find main JS, CSS, worker JS, and SVG files
const mainJsFile = assetFiles.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = assetFiles.find((f) => f.startsWith("index-") && f.endsWith(".css"));
const workerJsFile = assetFiles.find((f) => f.includes("qr-scanner-worker") && f.endsWith(".js"));
const logoFile = assetFiles.find((f) => f.includes("somfy_logo") && f.endsWith(".svg"));

console.log("📦 Found files:");
console.log("  - Main JS:", mainJsFile);
console.log("  - CSS:", cssFile);
console.log("  - Worker JS:", workerJsFile);
console.log("  - Logo:", logoFile);

// 4️⃣ Copy HTML
fs.copyFileSync(htmlFile, path.join(finalDir, "index.html"));

// 5️⃣ Copy CSS
if (cssFile) {
  fs.copyFileSync(path.join(assetsDir, cssFile), path.join(finalDir, "style.css"));
}

// 6️⃣ Inline worker JS content into main JS and create single main.js
if (mainJsFile) {
  let mainJs = fs.readFileSync(path.join(assetsDir, mainJsFile), "utf8");

  // Read and inline the worker file content
  if (workerJsFile) {
    const workerJs = fs.readFileSync(path.join(assetsDir, workerJsFile), "utf8");

    // Create a data URL from the worker content
    const workerDataUrl = `data:application/javascript;base64,${Buffer.from(workerJs).toString("base64")}`;

    console.log("🔧 Worker inlining:");
    console.log("   Original worker file:", workerJsFile);
    console.log("   Data URL length:", workerDataUrl.length);

    // Replace multiple possible patterns of worker file references
    // Pattern 1: Direct filename with ./ prefix
    const pattern1 = new RegExp(`\\./${workerJsFile}`, "g");
    const count1 = (mainJs.match(pattern1) || []).length;
    mainJs = mainJs.replace(pattern1, workerDataUrl);
    if (count1 > 0) console.log(`   ✓ Replaced ${count1} references with ./${workerJsFile}`);

    // Pattern 2: Filename without prefix
    const pattern2 = new RegExp(`(['\"])${workerJsFile}(['\"])`, "g");
    const count2 = (mainJs.match(pattern2) || []).length;
    mainJs = mainJs.replace(pattern2, `$1${workerDataUrl}$2`);
    if (count2 > 0) console.log(`   ✓ Replaced ${count2} references with quoted ${workerJsFile}`);

    // Pattern 3: URL-encoded or with URL path
    const pattern3 = new RegExp(`assets/${workerJsFile}`, "g");
    const count3 = (mainJs.match(pattern3) || []).length;
    mainJs = mainJs.replace(pattern3, workerDataUrl);
    if (count3 > 0) console.log(`   ✓ Replaced ${count3} references with assets/${workerJsFile}`);

    console.log("   Total patterns checked: 3");
  }

  // Replace logo file references to use the renamed logo filename
  if (logoFile) {
    const logoFileName = "somfy_logo.svg";
    mainJs = mainJs.replace(new RegExp(logoFile, "g"), logoFileName);
    console.log(`🎨 Logo references updated: ${logoFile} → ${logoFileName}`);
  }

  fs.writeFileSync(path.join(finalDir, "main.js"), mainJs);
  console.log("✓ main.js created with inlined worker");
}

// 7️⃣ Copy logo SVG
if (logoFile) {
  const logoFileName = "somfy_logo.svg";
  fs.copyFileSync(path.join(assetsDir, logoFile), path.join(finalDir, logoFileName));
}

// 8️⃣ Fix HTML paths to reference the renamed files
let html = fs.readFileSync(path.join(finalDir, "index.html"), "utf8");

// Replace CSS reference
html = html.replace(/\.\/assets\/.*?\.css/g, "./style.css");

// Replace JS reference
html = html.replace(/\.\/assets\/.*?\.js/g, "./main.js");

// Replace logo reference if it exists in HTML
if (logoFile) {
  html = html.replace(new RegExp(`./assets/${logoFile}`, "g"), "./somfy_logo.svg");
}

fs.writeFileSync(path.join(finalDir, "index.html"), html);

// 9️⃣ Copy vite.svg favicon if exists
const faviconPath = path.join(buildDir, "vite.svg");
if (fs.existsSync(faviconPath)) {
  fs.copyFileSync(faviconPath, path.join(finalDir, "vite.svg"));
}

console.log("\n✅ Done! Files created in 'final' folder:");
console.log("  - index.html");
console.log("  - style.css");
console.log("  - main.js");
if (logoFile) console.log("  - somfy_logo.svg");
console.log("\n🚀 Double-click index.html to open it in your browser!");
