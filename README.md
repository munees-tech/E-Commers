🛒 E-Commerce Website (MERN Stack)
A fully functional e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring:

🔐 JWT-based authentication

🛍️ Product browsing and cart system

💳 Razorpay integration for secure payments

🛠️ Admin dashboard for managing products, users, and orders

🚀 Features
🧑‍💻 User Features
Register/Login with JWT authentication

Browse products by category

Add/remove items to cart

Checkout with Razorpay payment gateway

View order history

🛠️ Admin Features
Secure admin login

CRUD operations for products & categories

⚙️ Tech Stack
Frontend: React.js, Tailwind CSS (or Bootstrap), Axios, Context API

Backend: Node.js, Express.js

Database: MongoDB (with Mongoose)

Authentication: JWT, bcrypt

Payment Gateway: Razorpay

📁 Project Structure
pgsql
Copy
Edit
/client               → React frontend  
/server               → Node + Express backend  
/server/models        → Mongoose models  
/server/routes        → Auth, product, order, payment routes  
/server/middleware    → Auth, admin protection  
/server/controllers   → Route controllers

cd ecommerce

Backend Setup
bash
Copy
Edit
cd server
npm install
npm run dev
Create .env:

env example

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret


Frontend Setup
cd client
npm install
npm start
💳 Payment Flow
User adds items to cart

Proceeds to checkout

Razorpay gateway opens with total price
