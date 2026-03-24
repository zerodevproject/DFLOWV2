import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,

    // Extend User Profiles with custom fields
    users: defineTable({
        ...authTables.users.fields,
        tagline: v.optional(v.string()),
    }).index("by_email", ["email"]),

    projects: defineTable({
        userId: v.string(), // Link to auth.userId()
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
        totalHours: v.number(),
        weekProgress: v.number(),
        objective: v.optional(v.string()),
        description: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    timeBlocks: defineTable({
        userId: v.string(),
        type: v.union(v.literal("work"), v.literal("flow"), v.literal("health"), v.literal("life")),
        projectId: v.optional(v.id("projects")),
        date: v.string(), // YYYY-MM-DD
        startTime: v.string(), // HH:mm
        endTime: v.string(), // HH:mm
        title: v.string(),
        status: v.union(v.literal("planned"), v.literal("completed"), v.literal("missed")),
        actualHours: v.optional(v.number()),
        notes: v.optional(v.string()),
    })
        .index("by_user_date", ["userId", "date"])
        .index("by_project", ["projectId"]),

    healthLogs: defineTable({
        userId: v.string(),
        date: v.string(),
        fastingState: v.union(v.literal("none"), v.literal("24h"), v.literal("36h"), v.literal("broken")),
        didExercise: v.boolean(),
        wifeTime: v.boolean(),
        churchTime: v.boolean(),
        notes: v.optional(v.string()),
    }).index("by_user_date", ["userId", "date"]),

    parkingLot: defineTable({
        userId: v.string(),
        content: v.string(),
        projectId: v.optional(v.id("projects")),
        createdAt: v.number(),
        isResolved: v.boolean(),
    }).index("by_user", ["userId"]),

    // The Super Template Engine Settings
    flowCycles: defineTable({
        userId: v.string(),
        cycleLength: v.number(),
        startDate: v.string(),
        projectQueue: v.array(v.string()), // Project IDs or names
        numCyclesAhead: v.number(),
        slots: v.array(v.any()), // Serialization of TemplateSlot
    }).index("by_user", ["userId"]),
});
