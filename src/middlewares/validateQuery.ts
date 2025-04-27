import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

export const validateQuery = (schema: yup.AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedQuery = await schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      (req as any).validatedQuery = validatedQuery;

      next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.errors,
        });
      }
      console.error("Server error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
