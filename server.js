import express from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLString, GraphQLObjectType, GraphQLList, GraphQLSchema, GraphQLNonNull, GraphQLInt } from "graphql";
import {config } from "dotenv"
config()

const PORT = process.env.PORT
const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]
const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]
const BookType = new GraphQLObjectType({
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

const AuthorType = new GraphQLObjectType({
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

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "The primary query",
    fields: () => ({
        getBook: {
            description: "Get book by ID",
            type: BookType,
            args: {
                id: {type: GraphQLInt},
            },
            resolve: (parent,args) => {
                return books.find(book => book.id === args.id)
            }
        },
        books: {
            type: GraphQLList(BookType),
            description: "All books",
            resolve: () => books
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: "All authors",
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Used for mutating the store",
    fields: () => ({
        addNewBook: {
            type: BookType,
            description: "Add new book to the store",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, orgs) => {
                const newBook = {id: books.length + 1, name: orgs.name, authorId: orgs.authorId}
                books.push(newBook)
                return newBook
            }
        },
        updateBook: {
            type: BookType,
            description: "Update existing book",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt), description: "ID of book to be updated"},
                name: {type: GraphQLNonNull(GraphQLString), description: "New name"},
                authorId: {type: GraphQLNonNull(GraphQLInt), description: "Author ID"}
            },
            resolve: (parent, args) => {
                const foundBook = books.findIndex(book => book.id === args.id);
                books[foundBook].name = args.name;
                books[foundBook].authorId = args.authorId
                return books[foundBook]
            }
        },
        deleteBook: {
            type: GraphQLList(BookType),
            description: "Delete existing a book",
            args: {
                id: {type: GraphQLNonNull(GraphQLInt), description: "ID of book to be deleted"}
            },
            resolve: (parent, args) => {
                const foundBook = books.findIndex(book => book.id === args.id)
                books.splice(foundBook, 1)
                return books
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})
const app = express();
app.use("/graphql", graphqlHTTP({ schema, graphiql: true }))


app.listen(PORT, () => console.log(`Started at https://localhost:${PORT}/`))
