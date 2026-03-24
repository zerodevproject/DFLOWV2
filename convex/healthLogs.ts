import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getForDate = query({
    args: { date: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return null;
        return await ctx.db
            .query("healthLogs")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
            .unique();
    },
});

export const upsert = mutation({
    args: {
        date: v.string(),
        fastingState: v.union(v.literal("none"), v.literal("24h"), v.literal("36h"), v.literal("broken")),
        didExercise: v.boolean(),
        wifeTime: v.boolean(),
        churchTime: v.boolean(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("healthLogs")
            .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, args);
            return existing._id;
        } else {
            return await ctx.db.insert("healthLogs", { ...args, userId });
        }
    },
});
