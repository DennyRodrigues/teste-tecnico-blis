import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Criando usuários com senha criptografada
  const hashedPassword1 = await bcrypt.hash("senha123", 10);
  const hashedPassword2 = await bcrypt.hash("senha456", 10);

  const user1 = await prisma.users.create({
    data: {
      name: "João Silva",
      birthdate: new Date("1990-01-01"),
      email: "joao.silva@example.com",
      password: hashedPassword1,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      name: "Maria Oliveira",
      birthdate: new Date("1995-05-15"),
      email: "maria.oliveira@example.com",
      password: hashedPassword2,
    },
  });

  // Criando habilidades
  const ability1 = await prisma.abilities.create({
    data: {
      name: "Desenvolvedor Backend",
    },
  });

  const ability2 = await prisma.abilities.create({
    data: {
      name: "Desenvolvedor Frontend",
    },
  });

  const ability3 = await prisma.abilities.create({
    data: {
      name: "Gerenciamento de Projetos",
    },
  });

  // Criando documentos
  await prisma.userDocuments.create({
    data: {
      name: "Documento Identidade",
      url: "http://exemplo.com/identidade",
      user_id: user1.id,
    },
  });

  await prisma.userDocuments.create({
    data: {
      name: "Certificado de Curso",
      url: "http://exemplo.com/certificado",
      user_id: user2.id,
    },
  });

  // Associando habilidades aos usuários
  await prisma.usersAbilities.create({
    data: {
      user_id: user1.id,
      ability_id: ability1.id,
      years_experience: 5,
    },
  });

  await prisma.usersAbilities.create({
    data: {
      user_id: user2.id,
      ability_id: ability2.id,
      years_experience: 3,
    },
  });

  await prisma.usersAbilities.create({
    data: {
      user_id: user2.id,
      ability_id: ability3.id,
      years_experience: 2,
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
