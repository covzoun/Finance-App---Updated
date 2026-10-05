const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css += `
@layer base {
  html, body {
    background-color: #f8fafc;
  }
  @media (prefers-color-scheme: dark) {
    html, body {
      background-color: #0a0a0a;
    }
  }
}
`;

fs.writeFileSync('src/index.css', css);
