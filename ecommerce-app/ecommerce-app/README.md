# Lumière — E-Commerce Web Application

A modern, responsive E-Commerce application built with React.js, featuring product listing, cart management, and a full checkout flow.

## Features

- **Home Page** — Hero section, category grid, featured products, value propositions
- **Products Listing** — Grid display with sidebar filters, real-time search, and sort
- **Product Details** — Full product info, quantity selector, related products
- **Cart Management** — Add/remove/update items, persistent cart (localStorage)
- **Checkout Flow** — 3-step: Shipping → Payment → Review with form validation
- **Search & Filter** — Real-time search, category filter, price/rating sort
- **Responsive Design** — Mobile-first layout
- **Loading States** — Skeleton loaders during API fetch
- **Error Handling** — Graceful error states

## Technologies Used

- React 18 (Vite)
- Tailwind CSS v3
- React Router DOM v6
- React Context API + useReducer
- Fake Store API (fakestoreapi.com)

## Setup Instructions

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/lumiere-ecommerce.git
cd lumiere-ecommerce

# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:5173

# Build for production
npm run build
```

## Project Structure

```
src/
├── context/
│   ├── CartContext.jsx        
│   └── ProductsContext.jsx    
├── components/
│   ├── Navbar.jsx             
│   ├── Footer.jsx             
│   ├── ProductCard.jsx        
│   ├── StarRating.jsx         
│   └── Skeleton.jsx           
├── pages/
│   ├── HomePage.jsx           
│   ├── ProductsPage.jsx       
│   ├── ProductDetailsPage.jsx 
│   ├── CartPage.jsx           
│   ├── CheckoutPage.jsx       
│   └── NotFoundPage.jsx       
└── App.jsx                    
```

## API Integration

Uses Fake Store API: https://fakestoreapi.com/products

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/products` | Products Listing |
| `/products/:id` | Product Details |
| `/cart` | Cart |
| `/checkout` | Checkout |
