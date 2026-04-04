const fs = require('fs');
let code = fs.readFileSync('src/routes/tree/+page.svelte', 'utf-8');

// Basic formatting for svelte:
// 1. Remove all indentation
// 2. Simple re-indentation based on <tag> vs </tag> and {blocks}

// As the bug is in prettier plugin, let's try a small workaround:
// since it's just HTML, maybe an API like js-beautify or similar exists?
code = code.replace(/^[ \t]+/gm, '');

let indented = [];
let indent = 0;
const indentStr = "    ";

let inScript = false;
let lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) { indented.push(""); continue; }

    // adjust indent pre-line for closing tags
    if (line.match(/^<\/[a-zA-Z0-9]+>/)) indent = Math.max(0, indent - 1);
    if (line.startsWith("{/if}") || line.startsWith("{/each}") || line.startsWith("{/await}")) indent = Math.max(0, indent - 1);
    if (line.startsWith("{:else")) indent = Math.max(0, indent - 1);

    indented.push(indentStr.repeat(indent) + line);

    // adjust indent post-line
    if (line.startsWith("{#if") || line.startsWith("{#each") || line.startsWith("{#await") || line.startsWith("{:else")) indent++;
    
    // basic HTML opening tags without closing on same line
    let openTags = (line.match(/<[a-zA-Z0-9]+[^>]*>/g) || []).length;
    let closeTags = (line.match(/<\/[a-zA-Z0-9]+>/g) || []).length;
    let selfCloseTags = (line.match(/<[a-zA-Z0-9]+[^>]*\/>/g) || []).length;

    let totalOpen = openTags - closeTags - selfCloseTags;
    if (totalOpen > 0 && !line.includes("</")) {
        indent += totalOpen;
    }
}

fs.writeFileSync('src/routes/tree/+page.svelte', indented.join('\n'));
