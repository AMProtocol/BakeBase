# BakeBase API

**AI-first food science reference API for baking ingredients**

BakeBase is production-ready REST API that serves structured, scientifically accurate data about baking ingredients and their functional properties. Designed specifically for AI agents, it provides clean schemas, semantic field names, rich metadata, and real chemistry calculations.

## 🎯 Core Features

- **Comprehensive Ingredient Database**: 60 ingredients across 16 categories (flours, eggs, fats, sugars, leaveners, liquids, salts, starches, chocolates, dairy, extracts, acids, spices, oils, nuts, thickeners, syrups)
- **Scientific Accuracy**: USDA FoodData Central values, peer-reviewed sources, validated chemistry calculations
- **Real Chemistry Calculations**: The `/combine` endpoint performs accurate hydration ratio calculations (counts ALL water sources), protein interaction analysis, leavening adequacy assessment with excessive leavening detection, and texture predictions
- **AI-Optimized**: Every endpoint returns `meta` objects with descriptions and field glossaries
- **OpenAPI 3.0**: Complete specification at `/docs/openapi.json`
- **Agent Guide**: Plain-language usage instructions at `/agents`

## 📚 API Endpoints

### Health Check
```bash
GET /health
```

**Example:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "BakeBase API",
  "version": "1.0.0"
}
```

---

### List All Ingredients
```bash
GET /ingredients
GET /ingredients?category=flour
GET /ingredients?function=emulsifying
```

**Examples:**
```bash
# Get all ingredients
curl http://localhost:3000/ingredients

# Get only flours
curl http://localhost:3000/ingredients?category=flour

# Get ingredients that emulsify
curl http://localhost:3000/ingredients?function=emulsifying
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123abc",
      "name": "All-Purpose Flour",
      "category": "flour",
      "description": "Versatile wheat flour with moderate protein content...",
      "water_content_pct": 11.9,
      "protein_content_pct": 10.3,
      "gluten_forming": true,
      "typical_hydration_ratio": 0.6,
      "primary_function": "Provides structure through gluten development...",
      "interactions": [...],
      "substitution_ratio": [...]
    }
  ],
  "meta": {
    "endpoint_description": "Returns a list of all baking ingredients...",
    "field_glossary": {
      "water_content_pct": "Water content as percentage of total weight",
      "gluten_forming": "Boolean indicating if ingredient can form gluten networks"
    }
  }
}
```

---

### Get Ingredient by ID
```bash
GET /ingredients/:id
```

**Example:**
```bash
curl http://localhost:3000/ingredients/clx123abc
```

---

### Search Ingredients
```bash
GET /ingredients/search?q=<query>
```

**Examples:**
```bash
# Search by name
curl http://localhost:3000/ingredients/search?q=butter

# Search by function
curl http://localhost:3000/ingredients/search?q=leavening

# Search by category
curl http://localhost:3000/ingredients/search?q=flour
```

---

### Combine Ingredients (Chemistry Analysis) 🔥
```bash
POST /ingredients/combine
Content-Type: application/json

{
  "ingredients": [
    { "ingredient_id": "clx123abc", "quantity_g": 100 },
    { "ingredient_id": "clx456def", "quantity_g": 50 }
  ]
}
```

**Example 1: Flour + Egg + Applesauce (No Leavening)**
```bash
curl -X POST http://localhost:3000/ingredients/combine \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": [
      { "ingredient_id": "clx_allpurpose_flour", "quantity_g": 100 },
      { "ingredient_id": "clx_whole_egg", "quantity_g": 50 },
      { "ingredient_id": "clx_applesauce", "quantity_g": 170 }
    ]
  }'
```

**Response (Excerpt):**
```json
{
  "success": true,
  "data": {
    "total_weight_g": 320,
    "hydration_analysis": {
      "flour_weight_g": 100,
      "liquid_weight_g": 175,
      "hydration_ratio_pct": 175,
      "assessment": "batter",
      "notes": "Batter consistency, suitable for cakes, pancakes, or quick breads."
    },
    "leavening_analysis": {
      "biological_present": false,
      "chemical_present": false,
      "mechanical_present": true,
      "adequacy": "adequate",
      "notes": "Leavening present: mechanical (whipped eggs/steam)."
    },
    "prediction": "This is a high-hydration batter (175% hydration ratio). Expected outcome: Dense, moist quick bread or cake. Without leavening, this will be compact and heavy, similar to a moist pound cake or quick bread. ⚠️ CRITICAL: No leavening agent detected. This mixture will produce a very dense, flat result unless mechanical leavening (whipped eggs) or steam provides lift. Consider adding baking powder (1-2 tsp per cup flour)...",
    "warnings": [
      "Extremely high hydration ratio. This will be a very thin batter.",
      "No leavening agent detected for a substantial amount of flour..."
    ]
  },
  "meta": {
    "endpoint_description": "Chemistry analysis of combined ingredients...",
    "field_glossary": {
      "hydration_ratio_pct": "Ratio of liquid to flour weight (e.g., 70 means 70g water per 100g flour)",
      "prediction": "Plain-language prediction of likely outcome for AI agent interpretation"
    }
  }
}
```

**Example 2: Bread Dough**
```bash
curl -X POST http://localhost:3000/ingredients/combine \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": [
      { "ingredient_id": "clx_bread_flour", "quantity_g": 500 },
      { "ingredient_id": "clx_water", "quantity_g": 350 },
      { "ingredient_id": "clx_instant_yeast", "quantity_g": 7 },
      { "ingredient_id": "clx_salt", "quantity_g": 10 }
    ]
  }'
```

---

### List Categories
```bash
GET /categories
```

**Example:**
```bash
curl http://localhost:3000/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "category": "flour",
      "count": 10,
      "examples": ["All-Purpose Flour", "Bread Flour", "Cake Flour"]
    },
    {
      "category": "egg",
      "count": 3,
      "examples": ["Whole Egg", "Egg Yolk", "Egg White"]
    },
    {
      "category": "fat",
      "count": 7,
      "examples": ["Unsalted Butter", "Coconut Oil", "Shortening"]
    },
    {
      "category": "sugar",
      "count": 8,
      "examples": ["Granulated Sugar", "Brown Sugar", "Powdered Sugar"]
    },
    {
      "category": "leavener",
      "count": 5,
      "examples": ["Baking Powder", "Baking Soda", "Active Dry Yeast"]
    },
    {
      "category": "liquid",
      "count": 4,
      "examples": ["Water", "Whole Milk", "Heavy Cream"]
    },
    {
      "category": "salt",
      "count": 2,
      "examples": ["Table Salt", "Kosher Salt"]
    },
    {
      "category": "starch",
      "count": 2,
      "examples": ["Cornstarch", "Tapioca Starch"]
    },
    {
      "category": "chocolate",
      "count": 2,
      "examples": ["Unsweetened Cocoa Powder", "Dark Chocolate"]
    },
    {
      "category": "dairy",
      "count": 3,
      "examples": ["Cream Cheese", "Sour Cream", "Plain Yogurt"]
    },
    {
      "category": "extract",
      "count": 2,
      "examples": ["Pure Vanilla Extract", "Almond Extract"]
    },
    {
      "category": "acid",
      "count": 2,
      "examples": ["White Vinegar", "Lemon Juice"]
    },
    {
      "category": "spice",
      "count": 2,
      "examples": ["Ground Cinnamon", "Ground Nutmeg"]
    },
    {
      "category": "oil",
      "count": 2,
      "examples": ["Vegetable Oil", "Extra Virgin Olive Oil"]
    },
    {
      "category": "nut",
      "count": 2,
      "examples": ["Almond Flour", "Chopped Walnuts"]
    },
    {
      "category": "thickener",
      "count": 2,
      "examples": ["Unflavored Gelatin", "Agar Agar Powder"]
    },
    {
      "category": "syrup",
      "count": 2,
      "examples": ["Honey", "Molasses"]
    }
  ],
  "meta": {
    "endpoint_description": "Returns all ingredient categories with counts...",
    "field_glossary": {...}
  }
}
```

---

### Agent Guide
```bash
GET /agents
```

Returns plain-language guide for AI agents including purpose, recommended usage, available endpoints, and key concepts.

---

### OpenAPI Specification
```bash
GET /docs/openapi.json
```

Returns complete OpenAPI 3.0 specification for generating client code.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

1. **Clone the repository**
```bash
git clone <your-repo>
cd bakebase-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL connection string:
```
DATABASE_URL="postgresql://username:password@localhost:5432/bakebase?schema=public"
PORT=3000
```

4. **Push database schema**
```bash
npx prisma db push
```

5. **Seed the database**
```bash
npm run db:seed
```

6. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 🏗️ Production Deployment

### Railway

1. **Create a new Railway project**
2. **Add PostgreSQL database** (Railway will provide `DATABASE_URL` automatically)
3. **Deploy from GitHub** or push the code
4. **Railway will automatically:**
   - Install dependencies
   - Build TypeScript
   - Generate Prisma Client
   - Push database schema
   - Seed the database
   - Start the server

### Docker

```bash
# Build image
docker build -t bakebase-api .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  bakebase-api
```

---

## 📊 Database Schema

### Ingredient Model
- **Nutritional**: `water_content_pct`, `protein_content_pct`, `fat_content_pct`, `starch_content_pct`, `sugar_content_pct`, `fiber_content_pct`
- **Chemical**: `ph_level_min`, `ph_level_max`
- **Physical**: `density_g_per_ml`, `standard_measurement_unit`
- **Functional**: `gluten_forming`, `emulsifying`, `leavening_type`, `hygroscopic`, `typical_hydration_ratio`
- **Metadata**: `interactions` (JSON), `substitution_ratio` (JSON), `temperature_sensitivity`, `source_notes`, `confidence_level`

---

## 🧪 Example Use Cases

### 1. Calculate Hydration Ratio
```javascript
// 500g flour + 350g water = 70% hydration
POST /ingredients/combine
{
  "ingredients": [
    { "ingredient_id": "flour_id", "quantity_g": 500 },
    { "ingredient_id": "water_id", "quantity_g": 350 }
  ]
}
// Returns: hydration_ratio_pct: 70
```

### 2. Predict Cake Texture
```javascript
// High sugar + fat = tender, moist cake
POST /ingredients/combine
{
  "ingredients": [
    { "ingredient_id": "cake_flour_id", "quantity_g": 240 },
    { "ingredient_id": "sugar_id", "quantity_g": 200 },
    { "ingredient_id": "butter_id", "quantity_g": 115 },
    { "ingredient_id": "eggs_id", "quantity_g": 100 },
    { "ingredient_id": "baking_powder_id", "quantity_g": 12 }
  ]
}
// Returns: predicted_texture_profile: ["rich", "tender", "moist", "sweet", "airy"]
```

### 3. Check Leavening Adequacy
```javascript
// Detect missing leavening agents
POST /ingredients/combine
{
  "ingredients": [
    { "ingredient_id": "flour_id", "quantity_g": 250 },
    { "ingredient_id": "milk_id", "quantity_g": 180 }
  ]
}
// Returns: leavening_analysis.adequacy: "none"
// Returns: warnings: ["No leavening agent detected..."]
```

---

## 🧬 Data Sources

- **USDA FoodData Central**: Primary source for nutritional composition
- **On Food and Cooking** by Harold McGee: Food science principles
- **Bread Science** by Emily Buehler: Yeast and fermentation
- **How Baking Works** by Paula Figoni: Ingredient functionality
- **Modernist Cuisine**: Advanced techniques and chemistry

All data includes `source_notes` and `confidence_level` fields for transparency.

---

## 📖 Key Concepts

### Hydration Ratio
The ratio of liquid to flour by weight. Example: 70% hydration = 70g water per 100g flour.
- **<60%**: Dry dough (pie crust, cookies)
- **60-70%**: Normal bread dough
- **70-100%**: High hydration (artisan breads)
- **>100%**: Batter (cakes, pancakes)

### Gluten Formation
Occurs when flour proteins (glutenin + gliadin) hydrate and develop through mixing. Creates elastic, chewy texture.

### Leavening Types
- **Biological**: Yeast produces CO2 via fermentation
- **Chemical**: Baking soda + acid, or baking powder
- **Mechanical**: Whipped eggs or steam from water in butter

### pH Environment
- **Acidic (<5.5)**: Enhances baking soda leavening, tenderizes gluten
- **Neutral (5.5-7.5)**: Standard baking environment
- **Alkaline (>7.5)**: Accelerates browning, can weaken gluten

---

## ✨ Recent Improvements (Feb 2026)

### Ingredient Database Expansion
- **Expanded from 33 to 60 ingredients** (+82% increase)
- **Added 11 new categories**: liquids, salts, starches, chocolates, dairy, extracts, acids, spices, oils, nuts, thickeners, syrups
- **Added critical missing ingredients**: water, milk, butter, salt, vinegar, oil, vanilla, cinnamon, honey, and more

### Chemistry Calculation Fixes
The `/combine` endpoint chemistry analysis has been significantly improved:

1. **Fixed Liquid Calculation** ✅
   - **Previous bug**: Only counted ingredients >70% water content, missing butter's 15.9% water
   - **Fix**: Now correctly counts ALL water from ALL ingredients
   - **Impact**: Accurate hydration ratios (e.g., 123.9g detected vs 76g old)

2. **Added Excessive Leavening Detection** ✅
   - **Previous bug**: 100g baking powder + 250g flour (40% ratio) reported as "adequate"
   - **Fix**: Now warns when >6% chemical or >4% biological leavening relative to flour
   - **Impact**: Prevents bitter taste, collapsed structures from too much leavening

3. **Fixed Contradictory Texture Predictions** ✅
   - **Previous bug**: Predicted "airy" texture with 0% hydration (impossible - no dough can form)
   - **Fix**: Only applies "airy" when hydration >30% OR no flour present
   - **Impact**: Eliminates contradictory predictions

4. **Added Leavening Weight Tracking** ✅
   - **Fix**: Tracks actual weights of chemical and biological leavening agents
   - **Impact**: Enables accurate ratio calculations and warnings

### Validation & Testing
- Created comprehensive test suite (`test_chemistry.ts`)
- Validated all fixes with real recipe scenarios
- Documented all changes in `PROGRESS_REPORT.md`

---

## 🤝 Contributing

Contributions welcome! Please:
1. Use scientifically accurate data
2. Cite sources in `source_notes`
3. Set appropriate `confidence_level`
4. Test with the `/combine` endpoint

---

## 📄 License

MIT

---

## 🙋 Questions?

Check the `/agents` endpoint for AI agent usage guidance, or `/docs/openapi.json` for the complete API specification.
