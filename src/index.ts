import { Hono } from "hono";
import {
  ProductInput,
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "./services/products";
import {
  CategoryInput,
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "./services/categories";
import {
  associateCategoryToProduct,
  disassociateCategoryToProduct,
} from "./services/product-category";

const app = new Hono();

app.get("/stores/:storeId/products", async (c) => {
  const storeId = c.req.param("storeId");
  const products = await getProducts({ storeId });

  return c.json({ products });
});

app.post("/stores/:storeId/products", async (c) => {
  const storeId = c.req.param("storeId");
  const body = await c.req.json();

  const result = ProductInput.safeParse(body);

  if (!result.success) {
    return c.json({ errors: result.error });
  }

  const product = await createProduct({ storeId, product: result.data });

  return c.json(product);
});

app.get("/stores/:storeId/products/:productId", async (c) => {
  const storeId = c.req.param("storeId");
  const productId = c.req.param("productId");
  const include = c.req.queries("include");

  const product = await getProduct({ storeId, productId, include });

  return c.json(product);
});

app.put("/stores/:storeId/products/:productId", async (c) => {
  const storeId = c.req.param("storeId");
  const productId = c.req.param("productId");
  const body = await c.req.json();

  const result = ProductInput.safeParse(body);

  if (!result.success) {
    return c.json({ errors: result.error });
  }

  const product = await updateProduct({
    productId,
    storeId,
    product: result.data,
  });

  return c.json(product);
});

app.post("/stores/:storeId/products/:productId/categories", async (c) => {
  const storeId = c.req.param("storeId");
  const productId = c.req.param("productId");
  const body = await c.req.json();
  const response = await associateCategoryToProduct({
    storeId,
    productId,
    categoryId: body.categoryId,
  });

  return c.json(response);
});

app.delete(
  "/stores/:storeId/products/:productId/categories/:categoryId",
  async (c) => {
    const storeId = c.req.param("storeId");
    const categoryId = c.req.param("categoryId");
    const productId = c.req.param("productId");
    const response = await disassociateCategoryToProduct({
      storeId,
      productId,
      categoryId,
    });

    return c.json(response);
  }
);

app.get("/stores/:storeId/categories", async (c) => {
  const storeId = c.req.param("storeId");
  const categories = await getCategories({ storeId });

  return c.json({ categories });
});

app.post("/stores/:storeId/categories", async (c) => {
  const storeId = c.req.param("storeId");
  const body = await c.req.json();

  const result = CategoryInput.safeParse(body);

  if (!result.success) {
    return c.json({ errors: result.error });
  }

  const category = await createCategory({ storeId, category: result.data });

  return c.json(category);
});

app.get("/stores/:storeId/categories/:categoryId", async (c) => {
  const storeId = c.req.param("storeId");
  const categoryId = c.req.param("categoryId");
  const include = c.req.queries("include");
  const category = await getCategory({ storeId, categoryId, include });

  return c.json(category);
});

app.put("/stores/:storeId/categories/:categoryId", async (c) => {
  const storeId = c.req.param("storeId");
  const categoryId = c.req.param("categoryId");
  const body = await c.req.json();

  const result = CategoryInput.safeParse(body);

  if (!result.success) {
    return c.json({ errors: result.error });
  }

  const category = await updateCategory({
    categoryId,
    storeId,
    category: result.data,
  });

  return c.json(category);
});

app.post("/stores/:storeId/categories/:categoryId/products", async (c) => {
  const storeId = c.req.param("storeId");
  const categoryId = c.req.param("categoryId");
  const body = await c.req.json();
  const response = await associateCategoryToProduct({
    storeId,
    productId: body.productId,
    categoryId,
  });

  return c.json(response);
});

app.delete(
  "/stores/:storeId/categories/:categoryId/products/:productId",
  async (c) => {
    const storeId = c.req.param("storeId");
    const categoryId = c.req.param("categoryId");
    const productId = c.req.param("productId");
    const response = await disassociateCategoryToProduct({
      storeId,
      productId,
      categoryId,
    });

    return c.json(response);
  }
);

export default app;
