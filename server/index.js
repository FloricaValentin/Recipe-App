const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
const  typeDefs = require ('./graphql/schema')
const resolvers = require('./graphql/resolvers')

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

const PORT = process.env.PORT || 4000;

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: PORT }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
