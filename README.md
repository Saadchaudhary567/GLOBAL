# KitchenZen — Live Website + Password-Protected Admin Panel

## What actually works
- Password-protected admin login with Firebase Authentication
- Login uses your Firebase email directly: `Admin435@gmail.com`
- Password `admin 123`
- Edit live home text and banner
- Add, edit and delete products
- Buy button URLs
- Prices, ratings, descriptions and categories
- Add, edit and delete full articles
- About, contact and social links
- 4 complete live website color themes
- 3 website font choices
- Upload images to Firebase Storage
- Image gallery
- Every saved change is stored in Firestore and updates the public website in real time
- Admin panel itself keeps its own design and does not change when a website theme is selected

## IMPORTANT: Why Firebase is included
GitHub Pages only hosts static files. It cannot securely store passwords or save changes by itself.
Firebase is the backend that makes the admin panel and instant live updates actually work.

## First-time setup (no coding)
1. Create a Firebase project.
2. Add a Web App.
3. Copy the Firebase configuration into `firebase-config.js`.
4. Enable Authentication > Email/Password.
5. Create Firestore Database in Production mode.
6. Create Storage.
7. Paste `firestore.rules` into Firestore Rules and publish.
8. Paste `storage.rules` into Storage Rules and publish.
9. Upload the project to GitHub.
10. Open `setup.html` on your deployed website and click the setup button ONCE.
11. Then log in at `admin.html`:
   - Email: `Admin435@gmail.com`
   - Password: `admin 123`
12. CHANGE THE PASSWORD before the site goes live. Firebase Authentication can do this from the Firebase Console.

## GitHub Pages
1. Create a new GitHub repository.
2. Upload every file in this project.
3. Go to Settings > Pages.
4. Source: Deploy from a branch.
5. Select `main` and `/root`.
6. Save.
7. Wait for the website link.

Your public website is `index.html`.
Your admin panel is `admin.html`.

## Security
Do not leave `setup.html` publicly available after the first successful setup. Delete it from GitHub after setup.
Do not use the demo password `admin 123` on a real public website.

## Affiliate links
Replace demo Amazon URLs with your own valid affiliate links and follow Amazon Associates rules.
