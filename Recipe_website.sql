CREATE TABLE "users" (
    "user_id" SERIAL PRIMARY KEY,
    "first_name" varchar NOT NULL,
    "last_name" varchar NOT NULL,
    "email" varchar UNIQUE NOT NULL,
    "created_at" timestamp DEFAULT(now())
);

CREATE TABLE "login_information" (
    "login_id" SERIAL PRIMARY KEY,
    "username" varchar UNIQUE NOT NULL,
    "password_hash" varchar NOT NULL,
    "user_id" integer UNIQUE NOT NULL
);

CREATE TABLE "recipe" (
    "recipe_id" SERIAL PRIMARY KEY,
    "user_id" integer NOT NULL,
    "recipe_name" varchar NOT NULL,
    "cook_time" integer,
    "oven_time" integer,
    "servings" integer,
    "difficulty_level" integer,
    "created_at" timestamp DEFAULT(now()),
    "updated_at" timestamp
);

CREATE TABLE "recipe_ingredients" (
    "recipe_id" integer,
    "ingredient_id" integer,
    "quantity" decimal,
    "unit" varchar,
    PRIMARY KEY ("recipe_id", "ingredient_id")
);

CREATE TABLE "ingredient" (
    "ingredient_id" SERIAL PRIMARY KEY,
    "ingredient_name" varchar UNIQUE NOT NULL
);

CREATE TABLE "instruction" (
    "instruction_id" SERIAL PRIMARY KEY,
    "recipe_id" integer NOT NULL,
    "step_number" integer NOT NULL,
    "instruction_type" varchar,
    "instruction_text" text NOT NULL
);

CREATE INDEX "idx_recipe_name" ON "recipe" ("recipe_name");

CREATE INDEX "idx_recipe_user" ON "recipe" ("user_id");

CREATE INDEX "idx_ingredient" ON "recipe_ingredients" ("ingredient_id");

CREATE INDEX "idx_instruction_order" ON "instruction" ("recipe_id", "step_number");

ALTER TABLE "login_information"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;

ALTER TABLE "recipe"
ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id") ON DELETE CASCADE;

ALTER TABLE "recipe_ingredients"
ADD FOREIGN KEY ("recipe_id") REFERENCES "recipe" ("recipe_id") ON DELETE CASCADE;

ALTER TABLE "recipe_ingredients"
ADD FOREIGN KEY ("ingredient_id") REFERENCES "ingredient" ("ingredient_id") ON DELETE CASCADE;

ALTER TABLE "instruction"
ADD FOREIGN KEY ("recipe_id") REFERENCES "recipe" ("recipe_id") ON DELETE CASCADE;