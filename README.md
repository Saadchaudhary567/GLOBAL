# KitchenZen Website

## Files
- index.html, style.css, site.js — Homepage (exactly 6 featured products, categories, about, articles preview)
- products.html, products.js — Full "All Products" catalog page (every published product, category filters, pros & cons quick-view)
- article.html, article.js — Full dedicated article page (opened when a visitor clicks an article)
- common.js — Shared Firebase setup + header/footer/theme logic used by every page
- admin.html, admin.css, admin.js — Admin Panel
- firebase-config.js, firestore.rules, storage.rules — Firebase project configuration and security rules

## How to use
1. Download and extract the ZIP.
2. Upload every file to your GitHub repository (same folder level as before).
3. GitHub Pages / your host will serve index.html, products.html, article.html and admin.html automatically.

## What's new
- Homepage always shows exactly 6 products, chosen from Admin Panel → Homepage Products tab.
- All other products appear only on the new All Products page (products.html), reachable from the "Products" nav link and the "View All Products" button.
- Product images use a pasted Image URL (no uploads) and sit inside a fixed, Amazon-style image area with Zoom and Position (Center/Top/Bottom/Left/Right) controls in the Product form.
- Pros & Cons no longer appear anywhere on the Homepage — they show on a product's review, opened from the All Products page.
- Articles open as a full, dedicated page (article.html) with clean ad-placeholder containers, recommended products and related articles — not a small popup.
- Article images also use a pasted Image URL.

## Before applying for AdSense
This website includes a useful starter structure, but approval is not guaranteed. Before applying:
- Publish your own original, helpful content.
- Complete real About, Contact, Privacy Policy and Terms pages.
- Add accurate affiliate disclosures.
- Verify product claims and recommendations.
- Use properly licensed images and comply with Amazon and Google policies.
