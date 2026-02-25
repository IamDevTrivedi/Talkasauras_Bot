FROM node:24-alpine

WORKDIR /app

RUN corepack enable pnpm 

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . . 

RUN pnpm db:generate
RUN pnpm run build

EXPOSE 5000

CMD [ "sh" , "-c" , "pnpm run db:migrate:deploy && pnpm run start" ]
