# 🍽️ Mise en Place — Recipe Finder & Meal Planner

A responsive, multi-page Recipe Finder and Meal Planner built with React.js, Context API + useReducer, React Router v6, and TheMealDB API.

---

## 🚀 Project Setup

```bash
git clone https://github.com/YOUR_USERNAME/recipe-planner.git
cd recipe-planner
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js (Vite) | UI framework + fast dev server |
| React Router DOM v6 | Multi-page routing |
| Context API + useReducer | Global state management |
| Tailwind CSS v3 | Utility-first styling |
| TheMealDB API | Free recipe data (no API key) |
| localStorage | Persistent favourites + meal plan |

---

## 📁 Folder Structure

```
src/
├── context/
│   ├── AppContext.jsx        # Context provider + helper methods
│   └── AppReducer.js        # Reducer + ACTION types + initialState
├── hooks/
│   └── index.js             # useMeals, usePagination, useLocalStorage
├── pages/
│   ├── Home.jsx             # Hero + featured recipes + categories
│   ├── Recipes.jsx          # Listing with search, filter, pagination
│   ├── RecipeDetail.jsx     # Full detail, ingredients, YouTube embed
│   ├── Favourites.jsx       # Saved favourites grid
│   └── MealPlanner.jsx      # 7-day weekly planner
├── components/
│   ├── Navbar.jsx           # Sticky nav with theme toggle
│   ├── SearchBar.jsx        # Reusable search input
│   ├── RecipeCard.jsx       # Card with favourite toggle
│   ├── CategoryFilter.jsx   # Pill category filters
│   ├── Pagination.jsx       # Page navigator
│   ├── MealPlanGrid.jsx     # 7-day × 3-slot grid
│   └── States.jsx           # Loader, Skeleton, EmptyState, ErrorState
├── utils/
│   ├── api.js               # All TheMealDB fetch calls
│   ├── localStorage.js      # loadState / saveState
│   └── constants.js         # DAYS, MEAL_SLOTS, CATEGORIES, RECIPES_PER_PAGE
├── App.jsx                  # BrowserRouter + Routes
├── main.jsx                 # Entry point
└── index.css                # Tailwind + CSS variables + component classes
```

---

## ✅ Features Implemented

### Must-Have
- [x] 5 pages via React Router v6
- [x] Context API + useReducer for all global state
- [x] Recipe search by name
- [x] Category filter (10 categories + full API list)
- [x] Pagination — 12 recipes per page with ellipsis
- [x] Recipe detail — ingredients, instructions, tags, area
- [x] Favourites — add/remove, badge count in navbar
- [x] 7-day Meal Planner — Breakfast / Lunch / Dinner slots
- [x] localStorage persistence for favourites and meal plan
- [x] Loading, error, and empty states everywhere

### Good-to-Have
- [x] Filter by area/cuisine (dropdown)
- [x] Dark/light mode toggle (via context + localStorage)
- [x] YouTube embed on detail page
- [x] Skeleton loader UI (shimmer cards)
- [x] Print meal plan
- [x] Responsive mobile nav
- [x] Animated page transitions (CSS fadeUp)

---

## 🧠 State Architecture

```js
// Global state shape (AppReducer.js)
{
  favourites: [],        // Array of meal objects
  mealPlan: {},          // { "Monday": { "Breakfast": meal, ... } }
  activeCategory: '',
  activeArea: '',
  theme: 'light',
}
```

Actions: `ADD_FAVOURITE`, `REMOVE_FAVOURITE`, `ADD_TO_PLAN`, `REMOVE_FROM_PLAN`, `SET_CATEGORY`, `SET_AREA`, `TOGGLE_THEME`, `LOAD_PERSISTED`

Persistence: `useEffect` watchers in `AppContext.jsx` sync `favourites`, `mealPlan`, and `theme` to localStorage automatically.

---

## 📡 API Endpoints

```
Search:     /search.php?s={name}
Category:   /filter.php?c={category}
Area:       /filter.php?a={area}
Detail:     /lookup.php?i={id}
Categories: /categories.php
Areas:      /list.php?a=list
Random:     /random.php
```

Base: `https://www.themealdb.com/api/json/v1/1`
