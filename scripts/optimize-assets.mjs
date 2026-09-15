import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const root = process.cwd();

async function run() {
  await mkdir(path.join(root, "public", "assets"), { recursive: true });
  await mkdir(path.join(root, "app"), { recursive: true });

  const logoSrc = path.join(root, "apphole-logo.png");
  const titleSrc = path.join(root, "apphole-title.png");

  await sharp(logoSrc).resize(512, 512, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(path.join(root, "public", "ah-logo.png"));
  await sharp(logoSrc).resize(192, 192, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(path.join(root, "app", "icon.png"));
  await sharp(logoSrc).resize(180, 180, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(path.join(root, "app", "apple-icon.png"));
  await sharp(logoSrc).resize(32, 32, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(path.join(root, "public", "favicon-32.png"));
  await sharp(titleSrc).resize({ width: 900, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(root, "public", "ah-title.png"));
  await sharp(titleSrc).resize({ width: 1200 }).extend({ top: 220, bottom: 220, left: 40, right: 40, background: "#ffffff" }).jpeg({ quality: 86 }).toFile(path.join(root, "public", "og.jpg"));
  await sharp(logoSrc).resize(640, 640, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png({ compressionLevel: 9 }).toFile(path.join(root, "public", "assets", "logo.png"));
  await sharp(titleSrc).resize({ width: 1000, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(path.join(root, "public", "assets", "wordmark.png"));
  console.log("Optimized AppHole logo and wordmark.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
