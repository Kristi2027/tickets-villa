Hostinger-ready Google GenAI project bundle
-------------------------------------------

What this bundle includes:
- index.html            -> Simple front-end demo that calls /api/genai.php
- api/config.php        -> Server-side config (place your API key here or set env vars)
- api/genai.php         -> Server-side PHP proxy that forwards to Google GenAI endpoint
- .htaccess             -> Ensures SPA routing works and /api/* is handled by PHP
- vite.config.ts        -> Example Vite config (base './')
- README.md             -> This file

Important security notes:
- Do NOT put your Google API key into client-side JS. Keep it server-side in api/config.php or as server environment variables.
- Restrict access to the API key (chmod 600 api/config.php).
- For production, prefer environment variables (Hostinger supports setting env vars in some plans) instead of hardcoding keys in files.

Steps to deploy on Hostinger (shared hosting with PHP + Apache):
1. Build your front-end:
   - In your project, set `base: './'` in vite.config.ts and run `npm run build`.
   - Copy the resulting build files into the site root (index.html at root and assets/* into assets/ or update index.html to point to hashed filenames).
   - Alternatively, use the included index.html and replace ./assets/index.js and ./assets/index.css with your Vite build files.

2. Upload files to Hostinger public folder (public_html/):
   - index.html
   - assets/ (JS/CSS built by Vite)
   - api/genai.php
   - api/config.php (edit and set your API key or set environment variables)
   - .htaccess

3. Edit api/config.php:
   - Set $GOOGLE_API_KEY to your key, OR set environment variables GOOGLE_API_KEY and GOOGLE_GENAI_ENDPOINT in your Hostinger control panel.
   - Example endpoint (may change): https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate

4. Ensure PHP cURL is enabled on your Hostinger account (most shared hosts have it enabled). If not, contact Hostinger support.

5. Test:
   - Visit https://yourdomain.com/ to load the demo page.
   - Enter a prompt and click Generate — the browser will POST to /api/genai.php and you should see the response.

Troubleshooting:
- If you get a 401/403 upstream, check your API key and the endpoint shape. Google may require different payload structure for different versions of the API.
- If cURL fails, check PHP error logs and confirm cURL extension is enabled.
- If SPA routes 404, ensure .htaccess is uploaded and mod_rewrite is enabled.

If you want, I can:
- Replace the placeholder frontend with your real Vite build files if you upload the `dist/` folder listing here.
- Adjust the PHP proxy to use API key via query param instead of Authorization header if your GenAI setup requires it.
