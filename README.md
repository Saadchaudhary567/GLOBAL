# KitchenZen Website

## Files
- index.html, style.css, site.js — Homepage (exactly 6 featured products, categories, about, articles preview)
- products.html, products.js — Full "All Products" catalog page (every published product, category filters, product details view)
- article.html, article.js — Full dedicated article page (opened when a visitor clicks an article)
- common.js — Shared Firebase setup + header/footer/theme logic used by every page
- admin.html, admin.css, admin.js — Admin Panel
- firebase-config.js, firestore.rules, storage.rules — Firebase project configuration and security rules

## How to use
1. Download and extract the ZIP.
2. Upload every file to your GitHub repository (same folder level as before).
3. GitHub Pages / your host will serve index.html, products.html, article.html and admin.html automatically.

## What's new
- Homepage always shows exactly 6 products, chosen from Admin Panel → Homepage Products tab. Each Homepage card has a single action button: **View Details** (opens the product on the All Products page).
- All other products appear only on the new All Products page (products.html), reachable from the "Products" nav link and the "View All Products" button. There, each product has both **View Details** (description, rating, price) and **Check Price** (affiliate link).
- Pros & Cons have been removed everywhere on the site — Homepage, product details, and article "Recommended Products" no longer show them.
- Product images use a pasted Image URL (no uploads) and sit inside a fixed, Amazon-style image area with Zoom and Position (Center/Top/Bottom/Left/Right) controls in the Product form.
- Articles open as a full, dedicated page (article.html) with clean ad-placeholder containers, recommended products and related articles — not a small popup.
- Article images also use a pasted Image URL.
- Responsive: the desktop/tablet product grid is unchanged. On mobile (screens ≤700px), the product grids (Homepage and All Products) show exactly 2 products per row instead of 1.

## Before applying for AdSense
This website includes a useful starter structure, but approval is not guaranteed. Before applying:
- Publish your own original, helpful content.
- Complete real About, Contact, Privacy Policy and Terms pages.
- Add accurate affiliate disclosures.
- Verify product claims and recommendations.
- Use properly licensed images and comply with Amazon and Google policies.
