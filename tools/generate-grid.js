// tools/generate-grid.js
// Generates the perspective grid background image.
// Requires: npm install canvas
// Run: node tools/generate-grid.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // Use node-canvas

const width = 1600; // Adjust size as needed for better quality/aspect ratio
const height = 1000;

function createGridBackground() {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- Background ---
  ctx.fillStyle = "#0c0c1e"; // Dark blue/purple
  ctx.fillRect(0, 0, width, height);

  // --- Horizon Glow ---
  const horizonY = height * 0.55; // Horizon line position
  const glowHeight = height * 0.6; // How far down the glow extends
  const gradient = ctx.createLinearGradient(0, horizonY - glowHeight * 0.1, 0, horizonY + glowHeight);
  gradient.addColorStop(0, "rgba(255, 0, 255, 0.0)");  // Fade in magenta near horizon
  gradient.addColorStop(0.15, "rgba(255, 0, 255, 0.18)"); // Peak magenta
  gradient.addColorStop(0.6, "rgba(0, 255, 255, 0.12)");  // Transition to cyan
  gradient.addColorStop(1, "rgba(0, 255, 255, 0.0)");   // Fade out cyan
  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizonY - glowHeight * 0.1, width, glowHeight * 1.1);

  // --- Grid Lines ---
  ctx.strokeStyle = 'rgba(123, 57, 255, 0.35)'; // Grid color (purple), slightly more opaque
  ctx.lineWidth = 1.5; // Grid line thickness

  const vanishingPointX = width * 0.5;
  const numHorizontalLines = 30; // More lines for finer detail
  const numVerticalLines = 60;   // Number of vertical lines spreading from center

  // --- Horizontal Lines (Perspective) ---
  for (let i = 0; i <= numHorizontalLines; i++) {
    const perspectiveFactor = i / numHorizontalLines; // 0 at horizon, 1 near bottom
    // Exponential scaling for perspective (lines get further apart closer to viewer)
    // Adjust power (e.g., 2.0 to 3.0) to change perspective strength
    const yPos = horizonY + Math.pow(perspectiveFactor, 2.8) * (height - horizonY);

    if (yPos > height) continue; // Don't draw below screen

    // Fade out lines further away (closer to horizon), subtle effect
    const alpha = (1 - perspectiveFactor * 0.5) * 0.8; // Base alpha 0.8, fades slightly
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha)); // Clamp alpha 0-1

    ctx.beginPath();
    ctx.moveTo(0, yPos);
    ctx.lineTo(width, yPos);
    ctx.stroke();
  }

  // --- Vertical Lines (Perspective) ---
  for (let i = 0; i <= numVerticalLines; i++) {
    const perspectiveFactor = Math.abs(i - numVerticalLines / 2) / (numVerticalLines / 2); // 0 at center, 1 at edge
    // Position on horizon - adjust multiplier for spread
    const xPosOnHorizon = vanishingPointX + (i - numVerticalLines / 2) * (width / numVerticalLines * 3.5);

    // Calculate intersection with bottom edge (simple linear perspective)
    // The further from center on horizon, the further out on bottom edge
    const bottomX = vanishingPointX + (xPosOnHorizon - vanishingPointX) * (height / (horizonY || 1)); // Avoid divide by zero

    // Fade out lines towards the edges
    const alpha = (1 - perspectiveFactor * 0.7) * 0.8; // Base alpha 0.8, fades more towards edge
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    ctx.beginPath();
    ctx.moveTo(xPosOnHorizon, horizonY);
    ctx.lineTo(bottomX, height); // Draw line to bottom edge
    ctx.stroke();
  }

  // --- Reset alpha ---
  ctx.globalAlpha = 1.0;

  // --- Save Image ---
  const outputPath = path.join(__dirname, '../public/assets/grid-bg.png'); // Save directly to public/assets
  try {
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Grid background generated and saved to: ${outputPath}`);
  } catch (error) {
     console.error(`❌ Error saving grid background image to ${outputPath}:`, error);
  }
}

// --- Run Generation ---
try {
  createGridBackground();
} catch (error) {
  console.error("❌ Failed to generate grid background:", error);
  process.exit(1); // Exit with error code if generation fails
}