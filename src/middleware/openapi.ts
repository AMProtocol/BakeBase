export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BakeBase API',
    version: '1.0.0',
    description: 'AI-first food science reference API for baking ingredients',
    contact: {
      name: 'BakeBase',
      url: 'https://github.com/yourusername/bakebase'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://your-app.railway.app',
      description: 'Production server'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        description: 'Check API health status and database connectivity',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    service: { type: 'string', example: 'BakeBase API' },
                    version: { type: 'string', example: '1.0.0' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/agents': {
      get: {
        summary: 'AI Agent Usage Guide',
        description: 'Returns plain-language guide for AI agents using this API',
        responses: {
          '200': {
            description: 'Agent guide',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AgentGuide'
                }
              }
            }
          }
        }
      }
    },
    '/ingredients': {
      get: {
        summary: 'List all ingredients',
        description: 'Returns all baking ingredients with optional filtering',
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Filter by category (flour, egg, fat, sugar, leavener)',
            schema: { type: 'string' }
          },
          {
            name: 'function',
            in: 'query',
            description: 'Filter by primary function (fuzzy search)',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'List of ingredients',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IngredientListResponse'
                }
              }
            }
          }
        }
      }
    },
    '/ingredients/{id}': {
      get: {
        summary: 'Get ingredient by ID',
        description: 'Returns complete data for a single ingredient',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Ingredient ID',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Ingredient details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IngredientResponse'
                }
              }
            }
          },
          '404': {
            description: 'Ingredient not found'
          }
        }
      }
    },
    '/ingredients/search': {
      get: {
        summary: 'Search ingredients',
        description: 'Fuzzy search by name, description, function, or category',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            description: 'Search query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Search results',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IngredientListResponse'
                }
              }
            }
          }
        }
      }
    },
    '/ingredients/combine': {
      post: {
        summary: 'Analyze ingredient combination',
        description: 'Performs real chemistry calculations on ingredient combinations and predicts baking outcome',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['ingredients'],
                properties: {
                  ingredients: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['ingredient_id', 'quantity_g'],
                      properties: {
                        ingredient_id: { type: 'string' },
                        quantity_g: { type: 'number', minimum: 0 }
                      }
                    }
                  }
                }
              },
              example: {
                ingredients: [
                  { ingredient_id: 'clx123abc', quantity_g: 100 },
                  { ingredient_id: 'clx456def', quantity_g: 50 },
                  { ingredient_id: 'clx789ghi', quantity_g: 170 }
                ]
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Chemistry analysis',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CombineResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input'
          },
          '404': {
            description: 'One or more ingredient IDs not found'
          }
        }
      }
    },
    '/categories': {
      get: {
        summary: 'List all categories',
        description: 'Returns ingredient categories with counts and examples',
        responses: {
          '200': {
            description: 'Category list',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryResponse'
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Ingredient: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          water_content_pct: { type: 'number', nullable: true },
          protein_content_pct: { type: 'number', nullable: true },
          fat_content_pct: { type: 'number', nullable: true },
          starch_content_pct: { type: 'number', nullable: true },
          sugar_content_pct: { type: 'number', nullable: true },
          fiber_content_pct: { type: 'number', nullable: true },
          ph_level_min: { type: 'number', nullable: true },
          ph_level_max: { type: 'number', nullable: true },
          density_g_per_ml: { type: 'number', nullable: true },
          standard_measurement_unit: { type: 'string' },
          gluten_forming: { type: 'boolean' },
          emulsifying: { type: 'boolean' },
          leavening_type: { type: 'string', nullable: true },
          hygroscopic: { type: 'boolean' },
          typical_hydration_ratio: { type: 'number', nullable: true },
          flavor_profile: { type: 'array', items: { type: 'string' } },
          primary_function: { type: 'string' },
          interactions: { type: 'array' },
          substitution_ratio: { type: 'array' },
          temperature_sensitivity: { type: 'string' },
          source_notes: { type: 'string' },
          confidence_level: { type: 'string' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      Meta: {
        type: 'object',
        properties: {
          endpoint_description: { type: 'string' },
          field_glossary: { type: 'object', additionalProperties: { type: 'string' } }
        }
      },
      IngredientListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Ingredient' }
          },
          meta: { $ref: '#/components/schemas/Meta' }
        }
      },
      IngredientResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/Ingredient' },
          meta: { $ref: '#/components/schemas/Meta' }
        }
      },
      CombineResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              total_weight_g: { type: 'number' },
              total_hydration_pct: { type: 'number' },
              total_protein_pct: { type: 'number' },
              total_fat_pct: { type: 'number' },
              total_sugar_pct: { type: 'number' },
              total_starch_pct: { type: 'number' },
              ph_range: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' }
                }
              },
              leavening_analysis: {
                type: 'object',
                properties: {
                  biological_present: { type: 'boolean' },
                  chemical_present: { type: 'boolean' },
                  mechanical_present: { type: 'boolean' },
                  adequacy: { type: 'string' },
                  notes: { type: 'string' }
                }
              },
              hydration_analysis: {
                type: 'object',
                properties: {
                  flour_weight_g: { type: 'number' },
                  liquid_weight_g: { type: 'number' },
                  hydration_ratio_pct: { type: 'number' },
                  assessment: { type: 'string' },
                  notes: { type: 'string' }
                }
              },
              protein_interaction_summary: { type: 'string' },
              predicted_texture_profile: { type: 'array', items: { type: 'string' } },
              ph_environment: { type: 'string' },
              prediction: { type: 'string' },
              warnings: { type: 'array', items: { type: 'string' } },
              ingredients_used: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    quantity_g: { type: 'number' },
                    percentage_of_total: { type: 'number' }
                  }
                }
              }
            }
          },
          meta: { $ref: '#/components/schemas/Meta' }
        }
      },
      CategoryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                count: { type: 'number' },
                examples: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          meta: { $ref: '#/components/schemas/Meta' }
        }
      },
      AgentGuide: {
        type: 'object',
        properties: {
          api_name: { type: 'string' },
          version: { type: 'string' },
          purpose: { type: 'string' },
          recommended_usage: { type: 'string' },
          available_endpoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                method: { type: 'string' },
                description: { type: 'string' },
                when_to_use: { type: 'string' }
              }
            }
          },
          key_concepts: { type: 'object', additionalProperties: { type: 'string' } }
        }
      }
    }
  }
};
