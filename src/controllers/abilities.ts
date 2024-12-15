import expressAsyncHandler from "express-async-handler";
import { ValidationErrorItem } from "joi";
import { prisma } from "../prismaClient";
import {
  abilitiesPostSchema,
  abilitiesPutSchema,
} from "../validation/abilities";

export const createAbilities = expressAsyncHandler(async (req, res) => {
  const { error, value } = abilitiesPostSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    res.status(400).json({
      message: "Validation error",
      details: error.details.map((err: ValidationErrorItem) => err.message),
    });
    return;
  }

  const ability = await prisma.abilities.findUnique({
    where: { name: value.name },
  });

  if (ability) {
    res.status(400).json({
      message: "Abilitiy with this name already exists",
    });
    return;
  }

  const newAbility = await prisma.abilities.create({
    data: {
      name: value.name,
      active: value.active,
    },
  });

  res.json({
    message: `Abilitiy ${newAbility.name} was created`,
  });
});

export const updateAbilities = expressAsyncHandler(async (req, res) => {
  const { error, value } = abilitiesPutSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    res.status(400).json({
      message: "Validation error",
      details: error.details.map((err: ValidationErrorItem) => err.message),
    });
    return;
  }

  const ability = await prisma.abilities.findUnique({
    where: { name: value.name },
  });

  if (!ability) {
    res.status(400).json({
      message: `Ability ${value.name} does not exists`,
    });
    return;
  }

  if (ability.active === value.active) {
    res.status(400).json({
      message: `Ability ${value.name} is already ${
        value.active ? "activated" : "disabled"
      }`,
    });
    return;
  }

  const newAbility = await prisma.abilities.update({
    where: {
      id: ability.id,
    },
    data: {
      name: ability.name,
      active: value.active,
    },
  });

  res.json({
    message: `Ability ${newAbility.name} was changed to be ${
      value.active ? "activated" : "disabled"
    }`,
  });
});
