const { gql } = require('apollo-server-express');

module.exports = gql`
  type Rental {
    id: ID!
    userId: ID!
    carId: ID!
    startDate: String
    endDate: String
    status: String
  }

  type AuthPayload {
    token: String!
  }

  type Query {
    _health: String!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    rentCar(carId: ID!, startDate: String, endDate: String): Rental!
  }
`;

