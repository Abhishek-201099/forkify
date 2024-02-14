import { API_URL, RES_PER_PAGE, TIMEOUT_SEC, KEY } from './config';

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

function createRecipeData(data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
}

export async function loadRecipe(id) {
  try {
    const res = await Promise.race([
      fetch(`${API_URL}${id}?key=${KEY}`),
      timeout(TIMEOUT_SEC),
    ]);
    const data = await res.json();
    if (!res.ok) throw new Error(`${data.message} ${res.status}`);

    state.recipe = createRecipeData(data);
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
      fetch(`${API_URL}?search=${query}&key=${KEY}`),
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
        ...(recipe.key && { key: recipe.key }),
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

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ingredient => {
        const ingArr = ingredient[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error(
            'Ingredients entered in wrong format, please enter in the correct format :)'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const fetchPost = fetch(`${API_URL}?key=${KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recipe),
    });

    const response = await Promise.race([fetchPost, timeout(TIMEOUT_SEC)]);

    const data = await response.json();
    if (!response.ok) throw new Error(`${data.message} ${response.status}`);

    state.recipe = createRecipeData(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
}

function init() {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
}

init();
