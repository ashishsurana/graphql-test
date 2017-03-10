export const typeDef = `
# Root Query
type Query {
    testQuery : String
}
`;

function testQuery(root, args, ctx){
    return "42";
}

export const resolver = {
  Query: {
    testQuery
  }
};