import { extendType, objectType, nonNull, stringArg } from "nexus";
import { NexusGenObjects } from "../nexus-typegen"; 

export const Link = objectType({
    name: "Link", // 1 
    definition(t) {  // 2
        t.nonNull.string("id"); // 3 
        t.nonNull.string("description"); // 4
        t.nonNull.string("url"); // 5
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
    },
});

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {   // 3
            type: "Link",
            resolve(parent, args, context, info) {    // 4
                return context.prisma.link.findMany();
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