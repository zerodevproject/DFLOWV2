import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getForDateRange = query({
    args: { startDate: v.string(), endDate: v.string() },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];
        return await ctx.db
            .query("timeBlocks")
            .withIndex("by_user_date", (q) =>
                q.eq("userId", userId).gte("date", args.startDate).lte("date", args.endDate)
            )
            .collect();
    },
});

export const upsert = mutation({
    args: {
        id: v.optional(v.id("timeBlocks")), // If it starts with tmpl-, we'll use a better strategy
        externalId: v.optional(v.string()), // For tmpl- IDs from frontend
        type: v.union(v.literal("work"), v.literal("flow"), v.literal("health"), v.literal("life")),
        projectId: v.optional(v.id("projects")),
        date: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        title: v.string(),
        status: v.union(v.literal("planned"), v.literal("completed"), v.literal("missed")),
        actualHours: v.optional(v.number()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Logic to handle tmpl- external IDs
        let existingId = args.id;
        if (args.externalId) {
            const existing = await ctx.db
                .query("timeBlocks")
                .withIndex("by_user_date", q => q.eq("userId", userId).eq("date", args.date))
                .filter(q => q.eq(q.field("title"), args.title)) // Weak link but work for now
                .unique();
            if (existing) existingId = existing._id;
        }

        const data = {
            userId,
            type: args.type,
            projectId: args.projectId,
            date: args.date,
            startTime: args.startTime,
            endTime: args.endTime,
            title: args.title,
            status: args.status,
            actualHours: args.actualHours,
            notes: args.notes,
        };

        if (existingId) {
            await ctx.db.patch(existingId, data);
            return existingId;
        } else {
            return await ctx.db.insert("timeBlocks", data);
        }
    },
});

export const remove = mutation({
    args: { id: v.id("timeBlocks") },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");
        const existing = await ctx.db.get(args.id);
        if (!existing || existing.userId !== userId) throw new Error("Unauthorized");
        await ctx.db.delete(args.id);
    },
});
