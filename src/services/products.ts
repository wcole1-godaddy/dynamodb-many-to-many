import ksuid from "ksuid";
import { z } from "zod";
import { Category, Product } from "../schema";
import { CatalogTable, CategoryEntity, ProductEntity, tableName } from "../db";

export const ProductInput = Product.omit({
  id: true,
  storeId: true,
  categoryIds: true,
  createdAt: true,
  updatedAt: true,
});
export type ProductInput = z.infer<typeof ProductInput>;

export const ProductsResponse = z.array(Product);
export type ProductsResponse = z.infer<typeof ProductsResponse>;

export async function createProduct({
  product: productInput,
  storeId,
}: {
  product: ProductInput;
  storeId: string;
}) {
  const result = ProductInput.safeParse(productInput);

  if (!result.success) {
    throw new Error("Invalid product");
  }

  const id = ksuid.randomSync().string;

  await ProductEntity.put({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `PRODUCT#${id}`,
    PK1: `PRODUCT#${id}`,
    SK1: `STORE#${storeId}`,
    id,
    storeId,
    ...result.data,
  });

  const { Item } = await ProductEntity.get({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `PRODUCT#${id}`,
  });

  return Product.parse(Item);
}

export async function updateProduct({
  productId,
  storeId,
  product: productInput,
}: {
  productId: string;
  storeId: string;
  product: ProductInput;
}) {
  const result = ProductInput.partial().safeParse(productInput);

  if (!result.success) {
    throw new Error("Invalid product");
  }
  const { Item: OldItem } = await ProductEntity.get({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `PRODUCT#${productId}`,
  });

  await ProductEntity.put({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `PRODUCT#${productId}`,
    updatedAt: new Date().toISOString(),
    ...OldItem,
    ...result.data,
  });

  const { Item } = await ProductEntity.get({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `PRODUCT#${productId}`,
  });

  return Product.parse(Item);
}

export async function getProducts({ storeId }: { storeId: string }) {
  const { Items } = await ProductEntity.query(
    `BUSINESS#${storeId}#STORE#${storeId}`,
    {
      beginsWith: `PRODUCT#`,
    }
  );

  return ProductsResponse.parse(Items) || [];
}

export async function getProduct({
  storeId,
  productId,
  include,
}: {
  storeId: string;
  productId: string;
  include: Array<string> | undefined;
}) {
  const { Items } = await CatalogTable.query(`PRODUCT#${productId}`, {
    index: "GSI1",
  });

  const categoryIds = Items?.reduce((acc: Array<string>, curr) => {
    if (curr.entity === "ProductCategory") {
      acc.push(curr.categoryId);
    }

    return acc;
  }, []);

  const product = Items?.find((item) => item.entity === "Product") || {};
  product.categoryIds = categoryIds;

  if (include?.includes("categories")) {
    const { Responses } = await CatalogTable.batchGet(
      categoryIds?.map((categoryId) =>
        CategoryEntity.getBatch({
          PK: `BUSINESS#${storeId}#STORE#${storeId}`,
          SK: `CATEGORY#${categoryId}`,
        })
      ) || []
    );

    product.categories = Responses?.[tableName]?.map((item: any) =>
      Category.parse(item)
    );
  }

  return Product.extend({ categories: z.array(Category).optional() }).parse(
    product
  );
}
