## HONO CLOUFLARE WORKER TEMPLATE

# Getting started

1. Install package

```
npm install
```

2. Setup D1 database by using wrangler

- `wrangler create d1 <database_name>` to create a new D1 database
- Copy output of `wrangler create d1 <database_name>` and paste it to `wrangler.toml` file

```toml
[[d1_databases]]
binding = "DB" # i.e. available in your Worker on env.DB
database_name = "your_database_name"
database_id = "your_database_id"
```

3. `npm run db:generate` to generate database schema in `drizzle` folder
4. ` wrangler d1 execute <db_name> --local --file=./drizzle/0000_a_random_name.sql` to create table in D1 database
5. Run locally

```
npm run deploy
```

6. Deploy to cloudflare
- first `wrangler d1 execute <db_name> --file=./drizzle/0000_a_random_name.sql`
```
npm run deploy
```

# What includes ?

- A template for hono web api target running on cloudflare worker. Which have drizzle orm for working with D1 database.
  Also, some customize middleware for handling error and authentication.

# Template structure and notes

- `src/middleware` contains some middleware authentication,etc
- `src/modules` contains modules. Each modules is a instance òf new Hono() to group endpoints which'll be imported
  in `src/modules/index,ts` and use at /api endpoint in `src/index.ts`
- `src/services` include services which handle business logic and interact with database
- `schema.ts` is a file to define schema for drizzle orm. Change this file then run `npm run db:generate` to generate
  new schema in `drizzle` folder


Created by lilhuy I'll update new features later <3
