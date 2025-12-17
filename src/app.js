const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { json } = require('express');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const typeDefs = require('./graphql/schemas');
const resolvers = require('./graphql/resolvers');
const { buildContext } = require('./graphql/context');
const { specs, swaggerUi } = require('./config/swagger');

const app = express();
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production' ? undefined : false
}));
app.use(cors());
app.use(json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rentals', rentalRoutes);

async function startApolloServer() {
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const server = new ApolloServer({ schema, context: buildContext });
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}

startApolloServer();

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    console.log(`GraphQL playground at http://localhost:${port}/graphql`);
  });
}

module.exports = app;

