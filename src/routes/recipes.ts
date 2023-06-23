import { container } from "../dependency-constructor";

const router = require('express').Router();

const recipeController  = container.cradle.recipeController;

router.get('/search', recipeController.getRecipes);

router.get('/similar', recipeController.getSimilarRecipes);

module.exports = router;