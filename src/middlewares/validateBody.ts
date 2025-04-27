import { Request, Response, NextFunction } from "express";
import * as yup from "yup";

export const validateBody = (schema: yup.AnySchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.errors,
        });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
