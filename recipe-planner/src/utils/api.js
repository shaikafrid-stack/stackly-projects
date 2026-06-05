const BASE = 'https://www.themealdb.com/api/json/v1/1';

export const searchByName = async (name) => {
  const res = await fetch(`${BASE}/search.php?s=${encodeURIComponent(name)}`);
  const data = await res.json();
  return data.meals || [];
};

export const filterByCategory = async (category) => {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  return data.meals || [];
};

export const filterByArea = async (area) => {
  const res = await fetch(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
  const data = await res.json();
  return data.meals || [];
};

export const getMealById = async (id) => {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] || null;
};

export const getCategories = async () => {
  const res = await fetch(`${BASE}/categories.php`);
  const data = await res.json();
  return data.categories || [];
};

export const getAreas = async () => {
  const res = await fetch(`${BASE}/list.php?a=list`);
  const data = await res.json();
  return data.meals || [];
};

export const getRandomMeals = async (count = 8) => {
  const promises = Array.from({ length: count }, () =>
    fetch(`${BASE}/random.php`).then(r => r.json()).then(d => d.meals?.[0])
  );
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};
