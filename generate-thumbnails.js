const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// Create the thumbnails directory if it doesn't exist
if (!fs.existsSync('./public/videos')) {
  fs.mkdirSync('./public/videos', { recursive: true });
}

// Generate thumbnails
const thumbnails = [
  { name: 'built-to-sell.jpg', colors: ['#7450dc', '#5462ff'] },
  { name: 'exit-five.jpg', colors: ['#5462ff', '#d1f602'] },
  { name: 'stu-mclaren.jpg', colors: ['#d1f602', '#e93aa5'] },
  { name: 'pomp-calum.jpg', colors: ['#e93aa5', '#5462ff'] },
  { name: 'lori-harder.jpg', colors: ['#7450dc', '#d1f602'] }
];

// Canvas setup
const width = 270;
const height = 480;

thumbnails.forEach((thumbnail) => {
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, thumbnail.colors[0]);
  gradient.addColorStop(1, thumbnail.colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add text overlay (replace with your own logic or leave out if not needed)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, height - 80, width, 80);

  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(thumbnail.name.replace('.jpg', '').replace(/-/g, ' '), width / 2, height - 40);

  // Write to file
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(`./public/videos/${thumbnail.name}`, buffer);
  
  console.log(`Generated thumbnail: ${thumbnail.name}`);
});

console.log('Thumbnail generation complete!'); 