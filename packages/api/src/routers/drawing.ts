/**
 * Drawing Router
 * Handles drawing canvas operations
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  organizationProcedure,
} from "../trpc";

export const drawingRouter = createTRPCRouter({
  /**
   * Get drawings for a project
   */
  listByProject: organizationProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify project belongs to organization
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          organizationId: ctx.organizationId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return ctx.prisma.drawing.findMany({
        where: { projectId: input.projectId },
        include: {
          createdBy: {
            select: { id: true, name: true, image: true },
          },
          _count: {
            select: { components: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  /**
   * Get single drawing with components
   */
  getById: organizationProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id: input.id },
        include: {
          project: {
            select: { organizationId: true },
          },
          components: {
            include: {
              connectionsFrom: true,
              connectionsTo: true,
            },
          },
          cutLines: true,
          detailAreas: true,
          createdBy: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      return drawing;
    }),

  /**
   * Create drawing
   */
  create: organizationProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        viewType: z.enum(["PLAN", "SECTION", "END_ELEVATION", "DETAIL"]).default("PLAN"),
        canvasData: z.record(z.unknown()).default({}),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify project belongs to organization
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          organizationId: ctx.organizationId,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      return ctx.prisma.drawing.create({
        data: {
          projectId: input.projectId,
          createdById: ctx.user!.id,
          name: input.name,
          description: input.description,
          viewType: input.viewType,
          canvasData: input.canvasData,
        },
      });
    }),

  /**
   * Update drawing
   */
  update: organizationProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().max(1000).optional().nullable(),
        viewType: z.enum(["PLAN", "SECTION", "END_ELEVATION", "DETAIL"]).optional(),
        canvasData: z.record(z.unknown()).optional(),
        thumbnail: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify drawing belongs to organization
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id },
        include: { project: { select: { organizationId: true } } },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      return ctx.prisma.drawing.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
    }),

  /**
   * Delete drawing
   */
  delete: organizationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify drawing belongs to organization
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id: input.id },
        include: { project: { select: { organizationId: true } } },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      await ctx.prisma.drawing.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Add component to drawing
   */
  addComponent: organizationProcedure
    .input(
      z.object({
        drawingId: z.string(),
        type: z.string(),
        name: z.string().optional(),
        properties: z.record(z.unknown()),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number().default(0),
          rotation: z.number().default(0),
        }),
        layerId: z.string().optional(),
        groupId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify drawing belongs to organization
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id: input.drawingId },
        include: { project: { select: { organizationId: true } } },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      return ctx.prisma.drawingComponent.create({
        data: {
          drawingId: input.drawingId,
          type: input.type as keyof typeof import("@provacx/database").ComponentType,
          name: input.name,
          properties: input.properties,
          position: input.position,
          layerId: input.layerId,
          groupId: input.groupId,
        },
      });
    }),

  /**
   * Update component
   */
  updateComponent: organizationProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        properties: z.record(z.unknown()).optional(),
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
          rotation: z.number(),
        }).optional(),
        isLocked: z.boolean().optional(),
        isVisible: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify component belongs to organization
      const component = await ctx.prisma.drawingComponent.findUnique({
        where: { id },
        include: {
          drawing: {
            include: { project: { select: { organizationId: true } } },
          },
        },
      });

      if (!component || component.drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Component not found",
        });
      }

      return ctx.prisma.drawingComponent.update({
        where: { id },
        data,
      });
    }),

  /**
   * Delete component
   */
  deleteComponent: organizationProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify component belongs to organization
      const component = await ctx.prisma.drawingComponent.findUnique({
        where: { id: input.id },
        include: {
          drawing: {
            include: { project: { select: { organizationId: true } } },
          },
        },
      });

      if (!component || component.drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Component not found",
        });
      }

      await ctx.prisma.drawingComponent.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Add connection between components
   */
  addConnection: organizationProcedure
    .input(
      z.object({
        drawingId: z.string(),
        fromComponentId: z.string(),
        toComponentId: z.string(),
        connectionType: z.string(),
        properties: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify drawing belongs to organization
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id: input.drawingId },
        include: { project: { select: { organizationId: true } } },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      return ctx.prisma.connection.create({
        data: {
          drawingId: input.drawingId,
          fromComponentId: input.fromComponentId,
          toComponentId: input.toComponentId,
          connectionType: input.connectionType as keyof typeof import("@provacx/database").ConnectionType,
          properties: input.properties,
        },
      });
    }),

  /**
   * Add cut line for sectional view
   */
  addCutLine: organizationProcedure
    .input(
      z.object({
        drawingId: z.string(),
        name: z.string(),
        startX: z.number(),
        startY: z.number(),
        endX: z.number(),
        endY: z.number(),
        direction: z.enum(["horizontal", "vertical"]).default("horizontal"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify drawing belongs to organization
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id: input.drawingId },
        include: { project: { select: { organizationId: true } } },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      return ctx.prisma.cutLine.create({
        data: input,
      });
    }),

  /**
   * Add detail area
   */
  addDetailArea: organizationProcedure
    .input(
      z.object({
        drawingId: z.string(),
        name: z.string(),
        x: z.number(),
        y: z.number(),
        width: z.number(),
        height: z.number(),
        scale: z.number().default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify drawing belongs to organization
      const drawing = await ctx.prisma.drawing.findUnique({
        where: { id: input.drawingId },
        include: { project: { select: { organizationId: true } } },
      });

      if (!drawing || drawing.project.organizationId !== ctx.organizationId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Drawing not found",
        });
      }

      return ctx.prisma.detailArea.create({
        data: input,
      });
    }),
});
