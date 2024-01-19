import {
  CatalogTable,
  CategoryEntity,
  ProductCategoryEntity,
  ProductEntity,
  tableName,
} from "../db";
import { Category, Product } from "../schema";

export async function associateCategoryToProduct({
  storeId,
  productId,
  categoryId,
}: {
  storeId: string;
  productId: string;
  categoryId: string;
}) {
  await CatalogTable.transactWrite([
    ProductCategoryEntity.putTransaction({
      PK: `PRODUCT#${productId}`,
      SK: `CATEGORY#${categoryId}`,
      PK1: `PRODUCT#${productId}`,
      SK1: `CATEGORY#${categoryId}`,
      productId,
      categoryId,
      createdAt: new Date().toISOString(),
    }),
    ProductCategoryEntity.putTransaction({
      PK: `CATEGORY#${categoryId}`,
      SK: `PRODUCT#${productId}`,
      PK1: `CATEGORY#${categoryId}`,
      SK1: `PRODUCT#${productId}`,
      productId,
      categoryId,
      createdAt: new Date().toISOString(),
    }),
  ]);

  const { Responses } = await CatalogTable.batchGet([
    ProductEntity.getBatch({
      PK: `BUSINESS#${storeId}#STORE#${storeId}`,
      SK: `PRODUCT#${productId}`,
    }),
    CategoryEntity.getBatch({
      PK: `BUSINESS#${storeId}#STORE#${storeId}`,
      SK: `CATEGORY#${categoryId}`,
    }),
  ]);

  const response = Responses?.[tableName]?.reduce(
    (acc: Record<"product" | "category", Product | Category>, curr: any) => {
      if (curr.entity === "Product") {
        acc.product = Product.parse(curr);
      }

      if (curr.entity === "Category") {
        acc.category = Category.parse(curr);
      }

      return acc;
    },
    {}
  );

  return response;
}

export async function disassociateCategoryToProduct({
  storeId,
  productId,
  categoryId,
}: {
  storeId: string;
  productId: string;
  categoryId: string;
}) {
  await CatalogTable.transactWrite([
    ProductCategoryEntity.deleteTransaction({
      PK: `PRODUCT#${productId}`,
      SK: `CATEGORY#${categoryId}`,
    }),
    ProductCategoryEntity.deleteTransaction({
      PK: `CATEGORY#${categoryId}`,
      SK: `PRODUCT#${productId}`,
    }),
  ]);

  const { Responses } = await CatalogTable.batchGet([
    ProductEntity.getBatch({
      PK: `BUSINESS#${storeId}#STORE#${storeId}`,
      SK: `PRODUCT#${productId}`,
    }),
    CategoryEntity.getBatch({
      PK: `BUSINESS#${storeId}#STORE#${storeId}`,
      SK: `CATEGORY#${categoryId}`,
    }),
  ]);

  const response = Responses?.[tableName]?.reduce(
    (acc: Record<"product" | "category", Product | Category>, curr: any) => {
      if (curr.entity === "Product") {
        acc.product = Product.parse(curr);
      }

      if (curr.entity === "Category") {
        acc.category = Category.parse(curr);
      }

      return acc;
    },
    {}
  );

  return response;
}
