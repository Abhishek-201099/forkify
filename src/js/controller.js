import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model';
import recipeView from './views/recipeView';

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
    recipeView.renderError();
  }
}

function init() {
  recipeView.addHandlerRender(controlRecipes);
}

init();
