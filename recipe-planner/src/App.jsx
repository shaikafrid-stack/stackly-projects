import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import RecipeDetail from './pages/RecipeDetail';
import Favourites from './pages/Favourites';
import MealPlanner from './pages/MealPlanner';

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main>{children}</main>
      <footer className="text-center py-8 text-sm" style={{ color: 'var(--muted)', borderTop: '1px solid var(--border)', marginTop: '3rem' }}>
        <span className="font-display">Mise en Place</span> · Powered by TheMealDB · Built with React + Vite
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/favourites" element={<Favourites />} />
            <Route path="/planner" element={<MealPlanner />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
