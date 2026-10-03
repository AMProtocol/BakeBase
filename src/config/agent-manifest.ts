// AgentManifest protocol specification for BakeBase
// Served at /.well-known/agent-manifest.json
// See: https://github.com/AMProtocol/AMP

export const agentManifest = {
  spec_version: "agentmanifest-0.3",
  name: "BakeBase",
  version: "1.3.0",
  description: "Agent reference API for baking — ingredient science, chemistry, and validation of external recipes (web, books, user input). Not a recipe library. Use POST /baking/validate-mix with gram weights from any source to map ingredients to the catalog, compute baker's hydration and salt/yeast ratios, and run combine analysis with pass/warn/fail checks.",
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
      path: "/baking/validate-mix",
      method: "POST",
      description: "PRIMARY FOR AGENTS: Validate an external ingredient list (e.g. parsed from a web recipe) by name + grams. Resolves to catalog IDs, merges duplicate lines, returns dough_metrics, full combine chemistry, and validation checks. Optional intent: bread, custard, cake, cookie, or auto.",
      parameters: [
        {
          name: "ingredients",
          type: "array",
          required: true,
          description: "Array of { ingredient_name, quantity_g }. Names matched to catalog (exact or search)."
        },
        {
          name: "intent",
          type: "string",
          required: false,
          description: "bread | custard | cake | cookie | auto (default auto)"
        },
        {
          name: "source_url",
          type: "string",
          required: false,
          description: "Optional URL of recipe being validated (for agent traceability only)"
        }
      ],
      response_description: "resolved_ingredients, dough_metrics, chemistry, validation { status, checks }, agent_guidance. Does not return cooking steps."
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
      path: "/baking/convert",
      method: "GET",
      description: "Convert volume or weight units to grams using catalog density_g_per_ml for an ingredient.",
      parameters: [
        { name: "ingredient_name", type: "string", required: true, description: "Catalog ingredient name (e.g. All-Purpose Flour)." },
        { name: "amount", type: "number", required: true, description: "Numeric amount in the given unit." },
        { name: "unit", type: "string", required: true, description: "cup, tbsp, tsp, ml, g, oz, lb, etc." }
      ],
      response_description: "quantity_g and conversion note; cup measures are approximate."
    },
    {
      path: "/baking/units",
      method: "GET",
      description: "List supported unit strings for /baking/convert.",
      parameters: [],
      response_description: "Array of unit names."
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
    "BakeBase is a safeguard for baking agents — NOT a recipe site. WORKFLOW: 1) Discover via AgentManifest registry. 2) POST /api/keys. 3) Parse a web recipe into ingredients (grams preferred, or quantity+unit). 4) POST /baking/validate-mix with intent bread and optional process { yeast_type, cold_retard_hours, style: baguette } for fermentation heuristics. 5) GET /baking/convert for cup/tsp→grams when needed. 6) GET /ingredients/* for substitutions. BakeBase flags bad ratios, unknown ingredients, and fermentation mismatches — it does not author steps or guarantee success.",
  contact: "mailto:brandon@agent-manifest.com",
  listing_requested: true,
  last_updated: "2026-10-03T00:00:00.000Z"
};
