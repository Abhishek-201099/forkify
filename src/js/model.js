import { API_URL, TIMEOUT_SEC } from './config';

export const state = {
  recipe: {},
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
      fetch(`${API_URL}/${id}`),
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
    console.log('Recipe loaded : ', state.recipe);
  } catch (error) {
    throw error;
  }
}
