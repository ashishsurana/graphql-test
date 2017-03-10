export const typeDef = `
# Mutations
type Mutation {
    testMutation(arg1: String) : String
}
`;

function testMutation(root, args, ctx){
	return args.arg1 + "world";
}

export const resolver = {
  Mutation: {
    testMutation
  }
};