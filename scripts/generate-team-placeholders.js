const fs = require('fs');
const path = require('path');

// Team member data
const teamMembers = [
  { name: "Omar Elsharkawi", initials: "OE", filename: "omar.jpg" },
  { name: "Ahmed Ashraf", initials: "AA", filename: "ahmed.jpg" },
  { name: "Mahmoud Adel", initials: "MA", filename: "mahmoud.jpg" },
  { name: "Ulfat Nasser", initials: "UN", filename: "ulfat.jpg" },
  { name: "Maryam Zaghlool", initials: "MZ", filename: "maryam.jpg" },
  { name: "Tasbih Attia", initials: "TA", filename: "tasbih.jpg" }
];

// Create team directory if it doesn't exist
const teamDir = path.join(__dirname, '../public/images/team');
if (!fs.existsSync(teamDir)) {
  fs.mkdirSync(teamDir, { recursive: true });
}

// Create placeholder files
teamMembers.forEach(member => {
  const filePath = path.join(teamDir, member.filename);
  
  // Create a simple SVG placeholder
  const svgContent = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0284c7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#grad)"/>
  <text x="200" y="200" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">${member.initials}</text>
  <text x="200" y="250" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${member.name}</text>
</svg>`;

  // Convert SVG to a simple HTML file that can be used as placeholder
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${member.name} - Placeholder</title>
  <style>
    body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%); }
    .placeholder { text-align: center; color: white; }
    .initials { font-size: 4rem; font-weight: bold; margin-bottom: 1rem; }
    .name { font-size: 1.2rem; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="placeholder">
    <div class="initials">${member.initials}</div>
    <div class="name">${member.name}</div>
    <div style="margin-top: 1rem; font-size: 0.9rem; opacity: 0.7;">Click to add photo</div>
  </div>
</body>
</html>`;

  // Create a simple text file as placeholder
  const textContent = `Placeholder for ${member.name} (${member.initials})
  
This is a placeholder file. Please replace with an actual photo.
  
Requirements:
- Size: 400x400 pixels
- Format: JPG or PNG
- Professional headshot
- Square aspect ratio

File should be named: ${member.filename}`;

  fs.writeFileSync(filePath.replace('.jpg', '.txt'), textContent);
  console.log(`Created placeholder for ${member.name}`);
});

console.log('\n✅ Team member placeholders created!');
console.log('📁 Check the team directory for placeholder files');
console.log('📸 Replace the .txt files with actual photos (.jpg or .png)');
console.log('📋 See README.md in the team directory for more details'); 