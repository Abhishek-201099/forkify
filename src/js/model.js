import { API_URL, RES_PER_PAGE, TIMEOUT_SEC } from './config';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export async function loadRecipe(id) {
  try {
    const res = await Promise.race([
      fetch(`${API_URL}${id}`),
      timeout(TIMEOUT_SEC),
    ]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    const { recipe } = data.data;
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
  } catch (error) {
    throw error;
  }
}

export async function loadSearchResults(query) {
  try {
    state.search.query = query;
    const res = await Promise.race([
      fetch(`${API_URL}?search=${query}`),
      timeout(TIMEOUT_SEC),
    ]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message}${res.status}`);
    const { recipes } = data.data;
    state.search.results = recipes.map(recipe => {
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        image: recipe.image_url,
      };
    });
    state.search.page = 1;
  } catch (error) {
    throw error;
  }
}

export function getSearchResultsPage(page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
}

export function updateServings(newServings) {
  state.recipe.ingredients.forEach(ingredient => {
    ingredient.quantity =
      (ingredient.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
}

function persistsBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export function addBookmark(recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistsBookmarks();
}

export function deleteBookmark(id) {
  const index = state.bookmarks.findIndex(bookmark => bookmark.id === id);
  state.bookmarks.splice(index, 1);

  if (state.recipe.id === id) state.recipe.bookmarked = false;
  persistsBookmarks();
}

function init() {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
}

init();
