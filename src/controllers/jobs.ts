import { prisma } from "@/prismaClient";
import { AuthenticatedRequest } from "@/types/requests";
import { findJobsByAbilities } from "@/externalServices/jobs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import expressAsyncHandler from "express-async-handler";

export const findJobsForUser = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user.userId;

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(400).json({
        message: "User does not exist",
      });
      return;
    }
    const userAbilities = await prisma.usersAbilities.findMany({
      where: { user_id: userId },
      select: {
        ability: {
          select: {
            name: true,
          },
        },
      },
    });

    const abilityNames = userAbilities.map((ua) => ua.ability.name);
    try {
      const results = await findJobsByAbilities(abilityNames);

      res.json({ data: results });
    } catch (error: unknown) {
      res.status(500).json({
        message: "Failed to find jobs for this user",
      });
      return;
    }
  }
);
