import { objectType } from "nexus";
import { context } from '../src/context';

export const User = objectType({
    name: "User",
    definition(t) {
        t.nonNull.string("id");
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.list.nonNull.field("links", {    // 1
            type: "Link",
            resolve(parent, args, context) {   // 2
                return context.prisma.user  // 3
                    .findUnique({ where: { id: parent.id} })
                    .links();
            },
        });
        t.nonNull.list.nonNull.field("votes", {
            type: "Link",
            resolve(parent, args, context){
                return context.prisma.user
                    .findUnique({where: {id: parent.id}})
                    .votes();
            }
        })
    },
});