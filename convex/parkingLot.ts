import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUnresolved = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("parkingLot")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("isResolved"), false))
            .collect();
    },
});

export const add = mutation({
    args: {
        content: v.string(),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        return await ctx.db.insert("parkingLot", {
            userId,
            content: args.content,
            projectId: args.projectId,
            createdAt: Date.now(),
            isResolved: false,
        });
    },
});

export const markResolved = mutation({
    args: { id: v.id("parkingLot") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        return await ctx.db.patch(args.id, { isResolved: true });
    },
});

export const remove = mutation({
    args: { id: v.id("parkingLot") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== userId) throw new Error("Unauthorized");
        return await ctx.db.delete(args.id);
    },
});
