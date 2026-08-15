-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Store Table
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profile Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    household_size INTEGER NOT NULL DEFAULT 1 CHECK (household_size > 0),
    weekly_budget DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (weekly_budget >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    preferred_store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    diet_constraints TEXT[] DEFAULT '{}', -- Array of tags: e.g., '{"vegan", "gluten-free"}'
    flexible_preferences JSONB DEFAULT '{}'::jsonb, -- For flexible JSONB preference data
    preference_bitmap BIGINT DEFAULT 0, -- Denormalized bitmap for fast optimization filtering
    fcm_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ingredients Table
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255),
    unit_conversions JSONB DEFAULT '{}'::jsonb, -- Store conversion factors (e.g., {"cup_to_grams": 240})
    default_calories INTEGER,
    default_protein DECIMAL(10, 2),
    default_carbs DECIMAL(10, 2),
    default_fat DECIMAL(10, 2),
    diet_flags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cuisine Styles Table
CREATE TABLE cuisine_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL
);

-- User Ingredient Preferences (Many-to-Many Junction Table for inclusions/exclusions)
CREATE TABLE user_ingredient_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    preference_type VARCHAR(50) NOT NULL CHECK (preference_type IN ('include', 'exclude')),
    PRIMARY KEY (user_id, ingredient_id)
);

-- User Cuisine Preferences (Many-to-Many Junction Table for inclusions/exclusions)
CREATE TABLE user_cuisine_preferences (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    cuisine_style_id UUID REFERENCES cuisine_styles(id) ON DELETE CASCADE,
    preference_type VARCHAR(50) NOT NULL CHECK (preference_type IN ('include', 'exclude')),
    PRIMARY KEY (user_id, cuisine_style_id)
);

-- Real-time Price Snapshots (Time-series data for ingredient prices per store)
CREATE TABLE ingredient_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    unit VARCHAR(50) NOT NULL, -- e.g., 'kg', 'lb', 'piece'
    confidence_score DECIMAL(5, 4) DEFAULT 1.0, -- Confidence score for price, 0.0 to 1.0
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance and JSON/Array querying
CREATE INDEX idx_ingredient_prices_recorded_at ON ingredient_prices(recorded_at DESC);
CREATE INDEX idx_ingredient_prices_ingredient_store ON ingredient_prices(ingredient_id, store_id);
CREATE INDEX idx_users_diet_constraints ON users USING GIN (diet_constraints);
CREATE INDEX idx_users_flexible_preferences ON users USING GIN (flexible_preferences);

-- Recipes Table (Central Catalog)
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    prep_instructions TEXT NOT NULL,
    estimated_servings INTEGER NOT NULL DEFAULT 1 CHECK (estimated_servings > 0),
    calories INTEGER,
    protein DECIMAL(10, 2),
    carbs DECIMAL(10, 2),
    fat DECIMAL(10, 2),
    micronutrients JSONB DEFAULT '{}'::jsonb,
    diet_tags TEXT[] DEFAULT '{}',
    cuisine_style_id UUID REFERENCES cuisine_styles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    optional_notes TEXT,
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Store Products (Linking ingredients to specific stores with price & availability)
CREATE TABLE store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    brand VARCHAR(255),
    package_size VARCHAR(100) NOT NULL, -- e.g., '500g', '1 bunch'
    unit_price DECIMAL(10, 2) NOT NULL,
    aisle VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal Plans
CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    estimated_total_cost DECIMAL(10, 2),
    optimization_metadata JSONB DEFAULT '{}'::jsonb, -- Auditable metadata about optimization runs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal Plan Recipes (Selection of recipes for the week)
CREATE TABLE meal_plan_recipes (
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    PRIMARY KEY (meal_plan_id, recipe_id)
);

-- Computed Shopping List (Aggregated quantities per meal plan)
CREATE TABLE meal_plan_shopping_list (
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    aggregated_quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    PRIMARY KEY (meal_plan_id, ingredient_id)
);

-- Pre-computed User Recipe Scores
CREATE TABLE user_recipe_scores (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    score DECIMAL(10, 4) NOT NULL,
    PRIMARY KEY (user_id, recipe_id)
);

-- User Owned Ingredients (Shopping List Management)
CREATE TABLE user_owned_ingredients (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    owned BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ingredient_id)
);
