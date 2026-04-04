const fs = require('fs');
const code = fs.readFileSync('src/routes/tree/+page.svelte', 'utf-8');

const regex = /<a[^>]*href="\/profile\/(\d*)"[^>]*>.*?<img[^>]*src="([^"]+)"[^>]*>.*?<h[345][^>]*>([^<]+)<\/h[345]>.*?<p[^>]*>([^<]+)<\/p>/gs;
let match;
let count = 0;
while((match = regex.exec(code)) !== null) {
    count++;
    console.log(`${count}. Name: ${match[3]} | Date/Desc: ${match[4]} | Image: ${match[2].substring(0, 30)}... | Link ID: ${match[1]}`);
}
