import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model';
import recipeView from './views/recipeView';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

async function controlRecipes() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;

    // starting spinner before awaiting for recipe data
    recipeView.spinner();

    // loading recipe using id from hash
    await model.loadRecipe(id);

    // rendering the recipe using model state
    recipeView.render(model.state.recipe);
  } catch (error) {
    alert(error);
  }
}

['hashchange', 'load'].map(event =>
  window.addEventListener(event, controlRecipes)
);
