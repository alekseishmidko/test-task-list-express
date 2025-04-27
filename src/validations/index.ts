import * as yup from "yup";
import { LIMIT } from "../server";

export const orderSchema = yup.object({
  order: yup
    .array()
    .of(yup.number().required().integer().min(1).max(1_000_000))
    .required()
    .min(1, "Order array must contain at least one ID"),
});

const selectionItemSchema = yup.object({
  id: yup.number().required().min(1).max(1_000_000),
  selected: yup.boolean().required(),
});
export const selectionSchema = yup.array().of(selectionItemSchema).min(1);

export const querySchema = yup.object({
  offset: yup
    .number()
    .transform((value, originalValue) =>
      Number.isNaN(originalValue) ? undefined : Number(originalValue)
    )
    .min(0)
    .default(0),
  limit: yup
    .number()
    .transform((value, originalValue) =>
      Number.isNaN(originalValue) ? undefined : Number(originalValue)
    )
    .min(1)
    .max(100)
    .default(LIMIT ?? 20),
  search: yup.string().optional().default(""),
});
