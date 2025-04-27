import express, { Request, Response } from "express";
import cors from "cors";
import * as yup from "yup";
import { validateBody } from "./middlewares/validateBody";
import { orderSchema, querySchema, selectionSchema } from "./validations";
import { validateQuery } from "./middlewares/validateQuery";
import * as dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT ?? 4000;
const ORIGIN = process.env.ORIGIN;
if (!ORIGIN) {
  console.error("ORIGIN required", ORIGIN);
}
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: ["GET", "POST"],
  })
);
app.use(express.json());
export const LIMIT = 20;
const ITEMS = Array.from({ length: 1_000_000 }, (_, i) => i + 1);

interface SessionData {
  selections: Set<number>;
  order: number[];
}

const sessionData: SessionData = {
  selections: new Set<number>(),
  order: [],
};

app.get(
  "/items",
  validateQuery(querySchema),
  async (req: Request, res: Response) => {
    try {
      const { offset, limit, search } = (req as any).validatedQuery;

      let filteredItems = ITEMS;

      if (search) {
        filteredItems = filteredItems.filter((item) =>
          item.toString().includes(search)
        );
      }

      let orderedItems = filteredItems;

      if (sessionData.order.length > 0) {
        const orderedSet = new Set(sessionData.order);

        // 1. Сначала те, которые в order
        const orderedPart = sessionData.order.filter((id) =>
          filteredItems.includes(id)
        );

        // 2. Потом остальные
        const restPart = filteredItems.filter((id) => !orderedSet.has(id));

        orderedItems = [...orderedPart, ...restPart];
      }

      const paginatedItems = orderedItems.slice(offset, offset + limit);

      const itemsWithSelection = paginatedItems.map((id) => ({
        id,
        isSelected: sessionData.selections.has(id),
      }));

      res.json({
        total: filteredItems.length,
        items: itemsWithSelection,
      });
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        return res.status(400).json({
          message: "Validation error",
          errors: err.errors,
        });
      }

      console.error(err);
      res.status(500).json({ message: "internal-error-items" });
    }
  }
);

app.post(
  "/select",
  validateBody(selectionSchema),
  (req: Request, res: Response) => {
    const selections = req.body as { id: number; selected: boolean }[];

    selections.forEach(({ id, selected }) => {
      if (selected) {
        sessionData.selections.add(id);
      } else {
        sessionData.selections.delete(id);
      }
    });

    res.json({ success: true });
  }
);

app.post("/order", validateBody(orderSchema), (req: Request, res: Response) => {
  const { order } = req.body as { order: number[] };

  sessionData.order = order;

  res.json({ success: true });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
