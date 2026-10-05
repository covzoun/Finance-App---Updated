const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css += `
@layer base {
  ::-webkit-scrollbar {
    display: none;
  }
  * {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
`;
fs.writeFileSync('src/index.css', css);
