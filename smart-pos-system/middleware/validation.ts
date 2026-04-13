import Joi from 'joi';
import { ValidationError } from '@/types';

/**
 * Validation schemas for common operations
 */

export const schemas = {
  // Authentication
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).required(),
  }),

  // Products
  createProduct: Joi.object({
    sku: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string().optional(),
    category: Joi.string().required(),
    unitPrice: Joi.number().positive().required(),
    wholesalePrice: Joi.number().positive().optional(),
    costPrice: Joi.number().positive().required(),
  }),

  // Transactions
  createTransaction: Joi.object({
    branchId: Joi.number().required(),
    customerId: Joi.number().optional(),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.number().required(),
          quantity: Joi.number().positive().required(),
          unitPrice: Joi.number().positive().required(),
          discountPercent: Joi.number().min(0).max(100).optional(),
        })
      )
      .min(1)
      .required(),
    discountAmount: Joi.number().min(0).optional(),
    taxAmount: Joi.number().min(0).optional(),
  }),

  // Customers
  createCustomer: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().pattern(/^(\+254|0)[0-9]{9}$/).required(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    creditLimit: Joi.number().positive().required(),
  }),

  // Inventory
  updateStock: Joi.object({
    productId: Joi.number().required(),
    branchId: Joi.number().required(),
    quantity: Joi.number().required(),
    reason: Joi.string().required(),
  }),
};

/**
 * Validation middleware factory
 */
export function validate(schema: Joi.Schema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const fields: Record<string, string> = {};
      error.details.forEach((detail) => {
        fields[detail.path.join('.')] = detail.message;
      });

      throw new ValidationError('Validation failed', fields);
    }

    req.validatedBody = value;
    next();
  };
}

/**
 * Validate query parameters
 */
export function validateQuery(schema: Joi.Schema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const fields: Record<string, string> = {};
      error.details.forEach((detail) => {
        fields[detail.path.join('.')] = detail.message;
      });

      throw new ValidationError('Query validation failed', fields);
    }

    req.validatedQuery = value;
    next();
  };
}
