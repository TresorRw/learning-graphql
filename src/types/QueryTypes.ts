import { GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLString, GraphQLList } from "graphql"
import { authors, books } from "../Data"

export const BookType = new GraphQLObjectType({
    name: "Books",
    description: "All books",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(auth => auth.id === book.authorId)
            }
        }
    })
})

export const AuthorType = new GraphQLObjectType({
    name: "Authors",
    description: "List of all authors",
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})
