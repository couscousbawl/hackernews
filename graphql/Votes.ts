import { objectType, extendType, nonNull, stringArg } from "nexus";
import { user } from "@prisma/client";

export const Vote = objectType({ 
    name: "Vote",
    definition(t) {
        t.nonNull.field("link", { type: "Link" });
        t.nonNull.field("user", { type: "User" });
    },
});

export const VoteMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("vote", { 
            type: "Vote",
            args: {
                linkId: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const { userId } = context;
                const { linkId } = args;

                if (!userId) {  // 1 
                    throw new Error("Cannot vote without logging in.");
                }

                const link = await context.prisma.link.update({  // 2
                    where: {
                        id: linkId
                    },
                    data: {
                        voters: {
                            connect: {
                                id: userId
                            }
                        }
                    }
                })

                const user = await context.prisma.user.findUnique({ where: { id: userId } });

                return {  // 3
                    link,
                    user: user as user
                };
            },
        })
    }
})