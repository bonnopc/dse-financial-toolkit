import { ApolloServer, gql } from 'apollo-server';
import fs from 'fs';

// Load your JSON data
const dividends = JSON.parse(fs.readFileSync('./dividends.json', 'utf8'));

// Define your GraphQL schema
const typeDefs = gql`
  type Dividend {
    company: String
    amount: Float
    date: String
  }
  type Query {
    dividends: [Dividend]
  }
`;

// Define your resolvers
const resolvers = {
  Query: {
    dividends: () => dividends
  }
};

// Create the Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Start the server
server.listen().then(({ url }: { url: string }) => {
  console.log(`🚀 Server ready at ${url}`);
});