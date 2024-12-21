import expressAsyncHandler from "express-async-handler";
import { ValidationErrorItem } from "joi";

import {
  userAbilitiesDeleteSchema,
  userAbilitiesGetSchema,
  userAbilitiesPostSchema,
} from "@/validation/userAbilties";

import { prisma } from "../prismaClient";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import { AuthenticatedRequest } from "@/types/requests";

export const createUserAbilities = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { error, value } = userAbilitiesPostSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation error",
        details: error.details.map((err: ValidationErrorItem) => err.message),
      });
      return;
    }

    const { ability_name: abilityName, years_experience: yearsExperience } =
      value;

    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(400).json({
        message: "user does not exist",
      });
      return;
    }

    const ability = await prisma.abilities.findUnique({
      where: { name: abilityName },
    });

    if (!ability) {
      res.status(400).json({
        message: "Ability with this name does not exist",
      });
      return;
    }

    if (!ability.active) {
      res.status(400).json({
        message: "Ability is not activated",
      });
      return;
    }

    try {
      const userAbility = await prisma.usersAbilities.create({
        data: {
          user_id: user.id,
          ability_id: ability.id,
          years_experience: yearsExperience,
        },
      });
      res.json({ data: userAbility });
    } catch (er: unknown) {
      const prismaError = er as PrismaClientKnownRequestError;
      if (prismaError.code === "P2002")
        res.status(400).json({
          message: "User already has this ability",
        });
      else {
        res.status(500).json({
          message: "Request to database failed",
        });
      }
      return;
    }
  }
);

export const getUserAbilities = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { error, value } = userAbilitiesGetSchema.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation error",
        details: error.details.map((err: ValidationErrorItem) => err.message),
      });
      return;
    }

    const page = value.page ? parseInt(value.page as string) : 1;
    const pageSize = value.pageSize ? parseInt(value.pageSize as string) : 10;
    const skip = (page - 1) * pageSize;

    console.log(value, page, pageSize);

    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(400).json({
        message: "user does not exist",
      });
      return;
    }

    try {
      const userAbilities = await prisma.usersAbilities.findMany({
        where: {
          user_id: req.user.userId,
        },
        select: {
          ability_id: false,
          user_id: false,
          years_experience: true,
          created_at: true,
          ability: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: pageSize,
      });

      const totalAbilities = await prisma.usersAbilities.count({
        where: { user_id: req.user.userId },
      });

      res.json({
        data: {
          user: user,
          userAbilities: userAbilities,
        },
        meta: {
          page,
          pageSize,
          total: totalAbilities,
          totalPages: Math.ceil(totalAbilities / pageSize),
        },
      });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to retrieve user abilities",
      });
      return;
    }
  }
);

// Esse request valida se as abilities existem, antes de tentar deletar.
// Caso elas existam, irá validar se a relação entre user e ability exist.
// Logo depois irá deletar as relações que foram encontradas.
// Caso erre aqui, irá retornar um erro dizendo que nem todas as abilities foram encontradas.
export const deleteUserAbilities = expressAsyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { error, value } = userAbilitiesDeleteSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      res.status(400).json({
        message: "Validation error",
        details: error.details.map((err: ValidationErrorItem) => err.message),
      });
      return;
    }

    const { ability_names } = value;

    try {
      // Find all requested abilities
      const abilities = await prisma.abilities.findMany({
        where: {
          name: {
            in: ability_names,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Check if all requested abilities exist
      if (abilities.length !== ability_names.length) {
        const foundAbilityNames = abilities.map((a) => a.name);
        const notFoundAbilities = ability_names.filter(
          (name: string) => !foundAbilityNames.includes(name)
        );

        res.status(404).json({
          message: "Some abilities were not found",
          details: {
            requested: ability_names,
            notFound: notFoundAbilities,
            found: foundAbilityNames,
          },
        });
        return;
      }
      const userAbilitiesCount = await prisma.usersAbilities.count({
        where: {
          user_id: req.user.userId,
          ability_id: {
            in: abilities.map((ability) => ability.id),
          },
        },
      });

      if (userAbilitiesCount !== ability_names.length) {
        const userAbilities = await prisma.usersAbilities.findMany({
          where: {
            user_id: req.user.userId,
            ability_id: {
              in: abilities.map((ability) => ability.id),
            },
          },
          include: {
            ability: {
              select: { name: true },
            },
          },
        });

        const userAbilityNames = userAbilities.map((ua) => ua.ability.name);
        const notFoundUserAbilities = ability_names.filter(
          (name: string) => !userAbilityNames.includes(name)
        );

        res.status(404).json({
          message: "Some abilities are not associated with the user",
          details: {
            requested: ability_names,
            notFound: notFoundUserAbilities,
            found: userAbilityNames,
          },
        });
        return;
      }
      const deletedAbilities = await prisma.usersAbilities.deleteMany({
        where: {
          user_id: req.user.userId,
          ability_id: {
            in: abilities.map((ability) => ability.id),
          },
        },
      });

      if (deletedAbilities.count !== ability_names.length) {
        res.status(500).json({
          message: "Not all abilities were deleted",
          details: {
            requested: ability_names,
            deletedCount: deletedAbilities.count,
            expectedCount: ability_names.length,
          },
        });
        return;
      }

      res.json({
        message: "All abilities were successfully deleted",
        data: {
          deletedCount: deletedAbilities.count,
          deletedAbilities: ability_names,
        },
      });
      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Failed to delete user abilities",
        details: {
          requested: ability_names,
        },
      });
      return;
    }
  }
);
