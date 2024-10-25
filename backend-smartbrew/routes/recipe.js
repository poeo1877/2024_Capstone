const express = require('express');
const router = express.Router();
const { Recipe } = require('../models'); // Adjust the path based on your structure

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.findAll({
            attributes: ['recipe_id', 'recipe_name'], // Select only necessary fields
        });
        res.json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findOne({
            where: { recipe_id: req.params.id },
            attributes: ['recipe_name', 'recipe_detail', 'product_name'], // Select the desired fields
        });
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
