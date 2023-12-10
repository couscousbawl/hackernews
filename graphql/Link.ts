import { extendType, objectType, nonNull, stringArg, intArg, inputObjectType, enumType, arg, list } from "nexus";
import { NexusGenObjects } from "../nexus-typegen"; 
import { Prisma } from "@prisma/client";

export const Link = objectType({
    name: "Link", // 1 
    definition(t) {  // 2
        t.nonNull.string("id"); // 3 
        t.nonNull.string("description"); // 4
        t.nonNull.string("url"); // 5
        t.nonNull.dateTime("createdAt"); //6
        t.field("postedBy", {   // 7
            type: "User",
            resolve(parent, args, context) {  // 8
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {  // 9
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        });
    },
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link }); // 1
        t.nonNull.int("count"); // 2
        t.id("id");  // 3
    },
});

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {   // 3
            type: "Feed",
            args: {
                filter: stringArg(),   // 1 for filteration
                skip: intArg(), // 2 for pagination
                take: intArg(), // 3 for pagination
                orderBy: arg({ type: list(nonNull(LinkOrderByInput))}) // 4 for sorting
            },
            async resolve(parent, args, context) {
                const where = args.filter   // 2
                    ? {
                          OR: [
                              { description: { contains: args.filter } },
                              { url: { contains: args.filter } },
                          ],
                      }
                    : {};
                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.linkOrderByWithRelationInput> | undefined,
                });
                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`;

                return {
                    links,
                    count,
                    id
                }
            },
        });
    },
});

export const LinkMutation = extendType({  // 1
    type: "Mutation",    
    definition(t) {
        t.nonNull.field("post", {  // 2
            type: "Link",  
            args: {   // 3
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            
            resolve(parent, args, context) {  
                const { description, url } = args;
                const { userId } = context;
                
                if(!userId){
                    throw new Error('Access Denied');
                }
                const newLink = context.prisma.link.create({   // 2
                    data: {
                        description,
                        url,
                        postedBy: {
                            connect: { id: userId }
                        }
                    },
                });
                return newLink;
            },
        });
    },
});