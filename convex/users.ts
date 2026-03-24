import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const viewer = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (userId === null) return null;
        return await ctx.db.get(userId);
    },
});

export const update = mutation({
    args: {
        name: v.optional(v.string()),
        tagline: v.optional(v.string()),
        image: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        await ctx.db.patch(userId, args);
    },
});
