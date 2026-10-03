// AgentManifest protocol specification for BakeBase
// Served at /.well-known/agent-manifest.json
// See: https://github.com/AMProtocol/AMP

export const agentManifest = {
  spec_version: "agentmanifest-0.3",
  name: "BakeBase",
  version: "1.1.0",
  description: "AI-first food science reference API for baking ingredients and scaled formulations. Provides ingredient chemistry, pan scaling math, reference recipes (e.g. NY cheesecake) with gram weights and IDs, and combine analysis with recipe classification (cheesecake_filling, graham_crust, etc.). Ideal for agents that must not hallucinate recipes: start at GET /formulations/:id?pan_diameter_in=12&analyze=true.",
  homepage: "https://bakebase.agent-manifest.com",
  documentation: "https://bakebase.agent-manifest.com/agents",
  categories: ["food-science", "chemistry"],
  primary_category: "reference",
  endpoints: [
    {
      path: "/ingredients",
      method: "GET",
      description: "List all baking ingredients with optional filtering by category or functional property. Use this to discover available ingredients, browse categories, or find ingredients matching specific criteria (e.g., all emulsifying ingredients, all liquids). Returns comprehensive data including nutritional composition, pH, interactions, and substitutions.",
      parameters: [
        {
          name: "category",
          type: "string",
          required: false,
          description: "Filter by category: flour, egg, fat, sugar, leavener, liquid, salt, starch, chocolate, dairy, extract, acid, spice, oil, nut, thickener, syrup"
        },
        {
          name: "function",
          type: "string",
          required: false,
          description: "Filter by functional property: emulsifying, gluten_forming, leavening, hygroscopic"
        }
      ],
      response_description: "Returns array of ingredient objects with id, name, category, description, nutritional composition (water/protein/fat/starch/sugar/fiber percentages), pH range, density, functional properties (gluten_forming, emulsifying, leavening_type, hygroscopic), typical_hydration_ratio, flavor_profile, interactions array, substitution_ratio array, temperature_sensitivity notes, source_notes, and confidence_level."
    },
    {
      path: "/ingredients/:id",
      method: "GET",
      description: "Get comprehensive functional properties for a single baking ingredient by its unique ID. Use this when you need detailed scientific data about how a specific ingredient behaves, including exact hydration ratios, protein content, pH range, interaction notes with other ingredients, and substitution recommendations.",
      parameters: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "Unique ingredient ID (e.g., 'clx123abc'). Obtain IDs from the /ingredients list endpoint."
        }
      ],
      response_description: "Returns single ingredient object with all properties including interactions (array of {ingredient, effect, notes}), substitution_ratio (array of {substitute, ratio, notes}), temperature_sensitivity guidance, primary_function description, and usage recommendations."
    },
    {
      path: "/ingredients/search",
      method: "GET",
      description: "Search ingredients by name, description, or functional properties. Use this for fuzzy matching when you don't have exact ingredient IDs - searches across name, description, category, and primary_function fields. Returns ingredients ranked by relevance.",
      parameters: [
        {
          name: "q",
          type: "string",
          required: true,
          description: "Search query (e.g., 'butter', 'high protein', 'acidic', 'leavening')"
        }
      ],
      response_description: "Returns array of matching ingredients with all properties. Empty array if no matches found."
    },
    {
      path: "/ingredients/combine",
      method: "POST",
      description: "CRITICAL ENDPOINT: Analyze chemical and functional interactions when combining multiple ingredients. This performs real chemistry calculations including hydration ratio analysis (counts ALL water sources), leavening adequacy assessment with excessive leavening detection (warns if >6% chemical or >4% biological leavening), texture predictions, pH balance, and specific recommendations. Use this to validate recipe formulations, predict outcomes, troubleshoot issues, or optimize ingredient ratios.",
      parameters: [
        {
          name: "ingredients",
          type: "array",
          required: true,
          description: "Array of objects with {ingredient_id: string, quantity_g: number}. Provide 2-10 ingredients for best results. All quantities in grams."
        }
      ],
      response_description: "Returns chemistry analysis including recipe_classification, baking_guidance, flourless-aware hydration_analysis (moisture_pct_of_batch when no flour), leavening_analysis, predicted_texture_profile, prediction, and warnings."
    },
    {
      path: "/formulations",
      method: "GET",
      description: "List reference baking formulations that scale by round pan diameter.",
      parameters: [],
      response_description: "Array of template summaries (id, name, reference pan, scaling_formula)."
    },
    {
      path: "/formulations/:id",
      method: "GET",
      description: "Build a scaled formulation with BakeBase ingredient IDs and optional chemistry.",
      parameters: [
        {
          name: "pan_diameter_in",
          type: "number",
          required: true,
          description: "Target round pan diameter in inches (e.g. 12 for a 12-inch springform)."
        },
        {
          name: "reference_diameter_in",
          type: "number",
          required: false,
          description: "Override reference diameter; default is the template reference pan."
        },
        {
          name: "analyze",
          type: "boolean",
          required: false,
          description: "If true, include chemistry for filling, crust, and full batch."
        }
      ],
      response_description: "Scaled lines with quantity_g and ingredient_id, baking steps, scale_factor, and optional chemistry array."
    },
    {
      path: "/baking/pan-scale",
      method: "GET",
      description: "Return (to/from)² scale factor for round pans of equal fill height.",
      parameters: [
        { name: "from_diameter_in", type: "number", required: true, description: "Reference pan diameter in inches." },
        { name: "to_diameter_in", type: "number", required: true, description: "Target pan diameter in inches." }
      ],
      response_description: "scale_factor and formula."
    },
    {
      path: "/categories",
      method: "GET",
      description: "List all ingredient categories with counts and examples. Use this to understand the structure of the ingredient database or to discover what types of ingredients are available before querying specific items.",
      parameters: [],
      response_description: "Returns array of category objects with {category: string, count: number, examples: string[]}. Shows all 16 categories: flour (10), egg (3), fat (7), sugar (8), leavener (5), liquid (4), salt (2), starch (2), chocolate (2), dairy (3), extract (2), acid (2), spice (2), oil (2), nut (2), thickener (2), syrup (2)."
    }
  ],
  pricing: {
    model: "free",
    free_tier: {
      queries_per_day: 10000,
      queries_per_month: null
    },
    paid_tier: null,
    support_url: "https://github.com/AMProtocol/BakeBase"
  },
  payment: null,
  authentication: {
    required: true,
    type: "api_key",
    instructions:
      "No account required. POST to /dashboard/keys to generate. Send as Authorization: Bearer <key> or X-API-Key: <key>. Keys expire in 90 days.",
    provisioning_endpoint: "/dashboard/keys",
    provisioning_method: "POST",
    provisioning_response: "Returns api_key in JSON when Accept: application/json"
  },
  rate_limits: {
    requests_per_minute: 120,
    requests_per_day: 10000
  },
  reliability: {
    maintained_by: "individual",
    uptime_percentage: 99,
    avg_response_time_ms: 120
  },
  agent_notes:
    "AGENT WORKFLOW (anti-hallucination): 1) Discover BakeBase via AgentManifest registry. 2) POST /api/keys for a key. 3) For cheesecake in a springform: GET /formulations/ny-cheesecake?pan_diameter_in=12&analyze=true — returns gram weights, ingredient IDs, baking steps, and chemistry. 4) Optional: GET /baking/pan-scale?from_diameter_in=9&to_diameter_in=12 for scale_factor only. 5) POST /ingredients/combine with {ingredient_id, quantity_g} to validate custom mixes; response includes recipe_classification and baking_guidance. Quantities in grams only (quantity_g). Combine classifies cheesecakes and flourless custards separately from bread dough. Ingredient data from USDA FoodData Central where noted.",
  contact: "mailto:brandon@agent-manifest.com",
  listing_requested: true,
  last_updated: "2026-10-03T00:00:00.000Z"
};
