const Recipe = require('../models/Recipe');

const resolvers = {
  Query: {
    recipes: async (_, { limit = 5, offset = 0 }) => {
      try {
        const recipes = await Recipe.find().limit(limit).skip(offset);
        return recipes;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch recipes');
      }
    },
    recipe: async (_, { id }) => {
      try {
        const recipe = await Recipe.findById(id);
        if (!recipe) throw new Error('Recipe not found');
        return recipe;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch recipe');
      }
    },
  },
  Mutation: {
    addRecipe: async (_, { input }) => {
      try {
        const recipe = new Recipe(input);
        await recipe.save();
        return recipe;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to add recipe');
      }
    },
    deleteRecipe: async (_, { id }) => {
      try {
        const deletedRecipe = await Recipe.findByIdAndDelete(id);
        if (!deletedRecipe) throw new Error('Recipe not found');
        return deletedRecipe;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to delete recipe');
      }
    },
    updateRecipe: async (_, { id, input }) => {
      try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true }
        );
        if (!updatedRecipe) throw new Error('Recipe not found');
        return updatedRecipe;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to update recipe');
      }
    },
  },
};

module.exports = resolvers;
