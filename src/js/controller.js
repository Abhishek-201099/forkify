import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import { MODEL_CLOSE_SEC } from './config';

async function controlRecipes() {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.spinner();
    await model.loadRecipe(id);
    recipeView.render(model.state.recipe);
    resultsView.render(model.getSearchResultsPage());
    bookmarksView.render(model.state.bookmarks);
  } catch (error) {
    recipeView.renderError();
  }
}

async function controlSearchResults(query) {
  try {
    resultsView.spinner();
    const query = searchView.getQuery();
    if (!query) return;
    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage());
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
}

function controlPagination(goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  model.updateServings(newServings);
  recipeView.render(model.state.recipe);
}

function controlAddBookmark() {
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  recipeView.render(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
}

function controlBookmarkView() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlDataUpload(newRecipe) {
  try {
    addRecipeView.spinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    bookmarksView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    addRecipeView.renderMessage();
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (error) {
    addRecipeView.renderError(error.message);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarkView);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  addRecipeView.addHandlerUpload(controlDataUpload);
}

init();
