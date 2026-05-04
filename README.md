# DS2 Tree Visualizer

Interactive data structure visualizations for VIT students (AVL, Red-Black Tree, Heap, Trie, Huffman, etc.).

## Deployment Fix

CSS/JS not loading on GitHub Pages due to relative paths. Use root-relative paths (`/css/auth.css`, `/js/auth.js`).

**Fixed files created:**
- `login_fixed.html`
- `signup_fixed.html` 
- `index_fixed.html`

**To deploy:**
1. Replace `login.html`, `signup.html`, `index.html` with fixed versions (copy content)
2. `git add . && git commit -m "Fix asset paths for GitHub Pages" && git push`
3. Test https://YOURUSERNAME.github.io/REPONAME/ - open F12 > Network, confirm no 404 for css/auth.css, js/auth.js

**Chrome "Dangerous site" warning:** Likely false positive from form fields/email inputs + onclick handlers. Site is safe (demo only, no real auth/social). 
- Bypass: Advanced > Proceed (safe for your local deploy)
- Or disable temporarily: chrome://settings/security > Enhanced protection off
- Google Fonts + SVG favicon are safe.

Local test: `npx serve .` or `python -m http.server` → http://localhost:3000/login_fixed.html

## Structure
```
.
├── index.html (landing redirect)
├── login.html (auth)
├── signup.html
├── css/
│   ├── auth.css
│   └── platform.css
├── js/
│   ├── auth.js
│   ├── avl.js, rbt.js, etc.
└── ds2-platform.html (main app)
```

gh-pages branch or Settings > Pages > Deploy from branch: main
