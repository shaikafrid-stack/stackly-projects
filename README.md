# ProStock — Product Management System

A fully responsive Product Management dashboard built with **React.js**, **Tailwind CSS**, and the [FakeStore API](https://fakestoreapi.com/products). Covers complete CRUD, search, filtering, form validation, loading states, and empty-state handling.

---

## 🖥 Screenshots

> Run the app locally and take screenshots from:
> - `/` → Dashboard with product table
> - Click **Add Product** → Form modal
> - Click ✏ on any row → Edit modal
> - Click 👁 → View modal
> - Click 🗑 → Delete confirmation

---

## ✨ Features

| Feature | Details |
|---|---|
| **Dashboard Layout** | Collapsible sidebar, sticky header/navbar, stats bar |
| **Product Table** | Name, category, price, qty, stock status, action buttons |
| **Add Product** | POST to API with form validation |
| **Edit Product** | PUT to API with pre-filled form |
| **Delete Product** | DELETE to API with confirmation dialog |
| **View Product** | Full detail modal |
| **Search** | Real-time filter by name or category |
| **Category Filter** | Dropdown to filter by electronics, jewelery, clothing |
| **Form Validation** | Required fields, numeric checks, URL format |
| **Loading States** | Spinner on initial load; button spinners during actions |
| **Empty State** | Friendly message when no products match filters |
| **Toast Notifications** | Auto-dismiss success/error feedback |
| **Responsive Design** | Mobile sidebar (hamburger), fluid grid layout |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Build Tool | Vite |
| Language | JavaScript (ES2020) |
| Fonts | DM Sans + Space Grotesk (Google Fonts) |

---

## 🗂 Project Structure

```
prostock/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx              ← React entry point
    ├── App.jsx               ← Root component, state & modal routing
    ├── index.css             ← Tailwind directives + custom styles
    ├── utils/
    │   ├── api.js            ← Axios instance + productService CRUD
    │   ├── constants.js      ← Categories, status options, initial form
    │   └── validation.js     ← Form validation logic
    ├── hooks/
    │   ├── useProducts.js    ← All product state + CRUD side-effects
    │   └── useToast.js       ← Toast notification state
    └── components/
        ├── Sidebar.jsx       ← Navigation sidebar (mobile-responsive)
        ├── Header.jsx        ← Sticky navbar with Add Product CTA
        ├── StatsBar.jsx      ← Summary cards (total, in stock, avg price)
        ├── Toolbar.jsx       ← Search input + category filter dropdown
        ├── ProductTable.jsx  ← Table with thumbnail, badge, action buttons
        ├── ProductForm.jsx   ← Reusable Add/Edit form with validation
        ├── Modal.jsx         ← Generic modal wrapper (Escape to close)
        ├── ViewModal.jsx     ← Product detail view
        ├── DeleteConfirm.jsx ← Delete confirmation dialog
        ├── Badge.jsx         ← Stock status pill badge
        ├── Spinner.jsx       ← Loading indicator
        └── Toast.jsx         ← Auto-dismiss notification
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9 (or yarn / pnpm)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/prostock.git
cd prostock
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```
Output is in the `dist/` folder.

### 5. Preview production build
```bash
npm run preview
```

---

## 🔌 API Reference

All calls target **`https://fakestoreapi.com/products`**.

| Action | Method | Endpoint | Body |
|---|---|---|---|
| Fetch all products | `GET` | `/products` | — |
| Fetch single product | `GET` | `/products/:id` | — |
| Create product | `POST` | `/products` | `{ title, price, description, image, category }` |
| Update product | `PUT` | `/products/:id` | `{ title, price, description, image, category }` |
| Delete product | `DELETE` | `/products/:id` | — |

> **Note**: FakeStoreAPI is a public mock API. POST / PUT / DELETE operations return simulated responses; data does not persist on the remote server. The app updates local state optimistically after each successful API response.

---

## 🪝 React Hooks Used

| Hook | Where | Purpose |
|---|---|---|
| `useState` | Throughout | Local UI state (modal, search, form fields) |
| `useEffect` | `useProducts` | Fetch products on mount |
| `useMemo` | `App` | Derive filtered product list without re-computing |
| `useCallback` | `useProducts` | Stable function references for CRUD handlers |
| Custom: `useProducts` | `App` | Encapsulates all product state + API calls |
| Custom: `useToast` | `App` | Encapsulates toast notification state |

---

## ✅ Validation Rules

| Field | Rules |
|---|---|
| Product Name | Required, min 3 characters |
| Category | Required (must select from list) |
| Price | Required, positive number, ≤ $1,000,000 |
| Quantity | Required, integer ≥ 0 |
| Image URL | Optional, must be valid `http/https` URL if provided |

---

## 📦 Submission Checklist

- [x] GitHub repository
- [x] README with setup instructions
- [x] Output screenshots (take after running locally)
- [ ] Demo video (optional — record with Loom or OBS)

---

## 📄 License

MIT © 2026
