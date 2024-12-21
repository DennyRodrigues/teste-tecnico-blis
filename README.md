### Descrição

Este projeto é uma API REST construída utilizando Node.js, Express, Typescript, Prisma (como ORM) e MySQL. Ele inclui funcionalidades para gerenciamento de usuários, documentos, habilidades e relacionamentos entre usuários e habilidades, além de autenticação via JWT.

### Como rodar esse projeto
1. Clone o Repositório
```bash
git clone <URL_DO_REPOSITORIO>
```
2. Instale as Dependências
```bash
yarn install
```
3. Configure o Banco de Dados
Crie um banco de dados MySQL e tome nota das informações de conexão.
Exemplo:
```
mysql://user:password@localhost:3306/database_name
```
4. Configure o Arquivo .env
Crie um arquivo .env na raiz do projeto com o seguinte conteúdo:
```env
BASE_URL_ADZUNA=
API_ID_ADZUNA=
API_KEY_ADZUNA=
DATABASE_URL="mysql://user:password@localhost:3306/database_name"
JWT_SECRET="seu_token_secreto_aqui"
```
5. Inicialize o Prisma e Aplique as Migrações
```bash
npx prisma init
npx prisma migrate dev
```
6. Popule o Banco de Dados
```bash
yarn seed
```
Este comando criará o seguinte usuário:
**Detalhes do Usuário:**

Nome: João Silva
Data de Nascimento: 01 de janeiro de 1990
Email: joao.silva@example.com
Senha: senha criptografada (utilizando bcrypt)
Habilidades:
Desenvolvedor Backend (5 anos de experiência)



7. Configure a API Externa
Este projeto utiliza a API pública Adzuna (https://developer.adzuna.com/)
Para configurá-la:

Crie uma conta no site da Adzuna
Obtenha os valores de API_ID e API_KEY
Atualize o arquivo .env com os valores:
```env
BASE_URL_ADZUNA=
API_ID_ADZUNA=
API_KEY_ADZUNA=
```

8. Inicie o Servidor de Desenvolvimento
```bash
yarn dev
```
O servidor estará disponível em http://localhost:3000 por padrão.
#### Considerações finais para rodar o projeto:

As environment variables do projeto são essas:
`BASE_URL_ADZUNA=`
`API_ID_ADZUNA`
`API_KEY_ADZUNA=`
`DATABASE_URL=""`
`JWT_SECRET=""`

### Endpoints

1. POST /users - Criar um usuário
   Cria um novo usuário no sistema.

2. POST /users/login - Login de usuário
   Realiza o login e retorna um token JWT para o usuário.

3. POST /users/documents - Enviar documento do usuário
   Permite que o usuário envie documentos (ex: RG, CNH).

4. POST /abilities - Criar uma habilidade
   Cria uma nova habilidade no sistema.

5. PUT /abilities - Editar uma habilidade
   Ativa ou desativa uma habilidade.

6. POST /users/abilities - Relacionar habilidade com usuário
   Relacione uma habilidade a um usuário.

7. DELETE /users/abilities - Remover habilidade do usuário
   Remove uma ou mais habilidades de um usuário.

8. GET /users/abilities - Listar habilidades do usuário
   Retorna as habilidades de um usuário, com paginação.

9. Extra: [GET] /job/me - Recomendação de Jobs
   Este endpoint retorna uma lista de empregos recomendados para o usuário, baseada nas habilidades que ele tem.

### Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. O processo de login gera um token que deve ser enviado como um **Bearer token**
Middleware de Autenticação
O middleware de verificação do token pode ser encontrado em:
`src/middlewares/verifyToken.ts`
Este middleware valida o token e, se válido, insere as informações do usuário (como o user.id) no request, permitindo que outros controllers acessem essas informações.

## Sobre as tecnologias usadas:

Validação: Foi utilizado a biblioteca **Joi** para validação de dados.
Upload de Arquivos: A biblioteca **Multer** é utilizada para o envio de documentos, com um limite de 10MB.
eslint: Esse projeto contém eslint para ajudar a padronizar o código.

### Atividade extra:

GET  API_URL/job/me
Irá retornar uma lista de jobs recomendadas para o usuário de acordo com as habilidades que ele salvou.

Lista de jobs recomendados para o usuário com base nas habilidades dele
```
