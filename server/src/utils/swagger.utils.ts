import { z } from 'zod';

/**
 * Converts a Zod schema to an OpenAPI/Swagger schema object
 * This is a basic implementation - you may need to extend it based on your needs
 */
export function zodToSwagger(schema: z.ZodType<any>): any {
   if (schema instanceof z.ZodString) {
      return { type: 'string' };
   }

   if (schema instanceof z.ZodNumber) {
      return { type: 'number' };
   }

   if (schema instanceof z.ZodBoolean) {
      return { type: 'boolean' };
   }

   if (schema instanceof z.ZodDate) {
      return { type: 'string', format: 'date-time' };
   }

   if (schema instanceof z.ZodArray) {
      return {
         type: 'array',
         items: zodToSwagger(schema.element),
      };
   }

   if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const properties: Record<string, any> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
         properties[key] = zodToSwagger(value as z.ZodType<any>);

         if (!(value instanceof z.ZodOptional)) {
            required.push(key);
         }
      }

      return {
         type: 'object',
         properties,
         ...(required.length > 0 && { required }),
      };
   }

   if (schema instanceof z.ZodOptional) {
      return zodToSwagger(schema.unwrap());
   }

   if (schema instanceof z.ZodEnum) {
      return {
         type: 'string',
         enum: schema.options,
      };
   }

   if (schema instanceof z.ZodLiteral) {
      return {
         type: typeof schema.value,
         enum: [schema.value],
      };
   }

   if (schema instanceof z.ZodUnion) {
      return {
         oneOf: schema.options.map((option: z.ZodType<any>) =>
            zodToSwagger(option)
         ),
      };
   }

   // Default fallback
   return { type: 'object' };
}

/**
 * Helper function to generate Swagger response schemas
 */
export function createSwaggerResponse(
   schema: z.ZodType<any>,
   description: string
) {
   return {
      description,
      content: {
         'application/json': {
            schema: zodToSwagger(schema),
         },
      },
   };
}

/**
 * Helper function to generate Swagger request body schemas
 */
export function createSwaggerRequestBody(
   schema: z.ZodType<any>,
   description: string
) {
   return {
      required: true,
      description,
      content: {
         'application/json': {
            schema: zodToSwagger(schema),
         },
      },
   };
}

/**
 * Helper function to generate error responses
 */
export const commonErrorResponses = {
   400: {
      description: 'Bad Request - Invalid input data',
      content: {
         'application/json': {
            schema: {
               type: 'object',
               properties: {
                  error: { type: 'string' },
                  message: { type: 'string' },
               },
            },
         },
      },
   },
   404: {
      description: 'Not Found - Resource not found',
      content: {
         'application/json': {
            schema: {
               type: 'object',
               properties: {
                  error: { type: 'string' },
                  message: { type: 'string' },
               },
            },
         },
      },
   },
   500: {
      description: 'Internal Server Error',
      content: {
         'application/json': {
            schema: {
               type: 'object',
               properties: {
                  error: { type: 'string' },
                  message: { type: 'string' },
               },
            },
         },
      },
   },
};
