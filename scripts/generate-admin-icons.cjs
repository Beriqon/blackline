const sharp = require('sharp');
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="80" fill="#111111"/><text x="256" y="340" text-anchor="middle" font-family="Georgia" font-size="300" fill="#d6bf96">B.</text></svg>';
Promise.all([192,512].map(size=>sharp(Buffer.from(svg)).resize(size,size).png().toFile('public/admin/icon-'+size+'.png'))).catch(()=>process.exit(1));
