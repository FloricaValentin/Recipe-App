const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Recipe {
    id: ID!
    name: String!
    description: String!
    ingredients: [String!]!
    instructions: [String!]!
  }

  type Query {
    recipes(limit: Int, offset: Int): [Recipe]
    recipe(id: ID!): Recipe
  }

  type Mutation {
    addRecipe(input: AddRecipeInput!): Recipe
    deleteRecipe(id: ID!): Recipe
    updateRecipe(id: ID!, input: UpdateRecipeInput!): Recipe
  }

  input AddRecipeInput {
    name: String!
    description: String!
    ingredients: [String!]!
    instructions: [String!]!
  }

  input UpdateRecipeInput {
    name: String
    description: String
    ingredients: [String!]
    instructions: [String!]
  }
`;

module.exports = typeDefs;
