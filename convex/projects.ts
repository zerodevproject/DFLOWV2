import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("projects")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
    },
});

export const add = mutation({
    args: {
        name: v.string(),
        emoji: v.string(),
        color: v.string(),
        status: v.union(
            v.literal("active"),
            v.literal("on-hold"),
            v.literal("completed"),
            v.literal("archived"),
            v.literal("background")
        ),
        objective: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        return await ctx.db.insert("projects", {
            userId,
            name: args.name,
            emoji: args.emoji,
            color: args.color,
            status: args.status,
            totalHours: 0,
            weekProgress: 0,
            objective: args.objective,
            description: args.description,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("projects"),
        updates: v.object({
            name: v.optional(v.string()),
            emoji: v.optional(v.string()),
            color: v.optional(v.string()),
            status: v.optional(v.union(
                v.literal("active"),
                v.literal("on-hold"),
                v.literal("completed"),
                v.literal("archived"),
                v.literal("background")
            )),
            objective: v.optional(v.string()),
            description: v.optional(v.string()),
            totalHours: v.optional(v.number()),
            weekProgress: v.optional(v.number()),
        }),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, args.updates);
    },
});

export const remove = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== userId) throw new Error("Unauthorized");

        await ctx.db.delete(args.id);
    },
});
