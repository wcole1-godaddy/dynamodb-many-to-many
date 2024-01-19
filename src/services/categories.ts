import { z } from "zod";
import ksuid from "ksuid";
import { Category, Product } from "../schema";
import { CatalogTable, CategoryEntity, ProductEntity, tableName } from "../db";

export const CategoryInput = Category.omit({
  id: true,
  storeId: true,
  productIds: true,
  createdAt: true,
  updatedAt: true,
});
export type CategoryInput = z.infer<typeof CategoryInput>;
export const CategoriesResponse = z.array(Category);
export type CategoriesResponse = z.infer<typeof CategoriesResponse>;

export async function createCategory({
  storeId,
  category: cateogryInput,
}: {
  storeId: string;
  category: CategoryInput;
}) {
  const result = CategoryInput.safeParse(cateogryInput);

  if (!result.success) {
    throw new Error("Invalid category");
  }

  const id = ksuid.randomSync().string;

  await CategoryEntity.put({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `CATEGORY#${id}`,
    PK1: `CATEGORY#${id}`,
    SK1: `STORE#${storeId}`,
    id,
    storeId,
    ...result.data,
  });

  const { Item } = await CategoryEntity.get({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `CATEGORY#${id}`,
  });

  return Category.parse(Item);
}

export async function updateCategory({
  categoryId,
  storeId,
  category: categoryInput,
}: {
  categoryId: string;
  storeId: string;
  category: CategoryInput;
}) {
  const result = CategoryInput.partial().safeParse(categoryInput);

  if (!result.success) {
    throw new Error("Invalid product");
  }
  const { Item: OldItem } = await CategoryEntity.get({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `CATEGORY#${categoryId}`,
  });

  await CategoryEntity.put({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `CATEGORY#${categoryId}`,
    updatedAt: new Date().toISOString(),
    ...OldItem,
    ...result.data,
  });

  const { Item } = await CategoryEntity.get({
    PK: `BUSINESS#${storeId}#STORE#${storeId}`,
    SK: `CATEGORY#${categoryId}`,
  });

  return Category.parse(Item);
}

export async function getCategories({ storeId }: { storeId: string }) {
  const { Items } = await CategoryEntity.query(
    `BUSINESS#${storeId}#STORE#${storeId}`,
    {
      beginsWith: `CATEGORY#`,
    }
  );

  return CategoriesResponse.parse(Items) || [];
}

export async function getCategory({
  storeId,
  categoryId,
  include,
}: {
  storeId: string;
  categoryId: string;
  include: Array<string> | undefined;
}) {
  const { Items } = await CatalogTable.query(`CATEGORY#${categoryId}`, {
    index: "GSI1",
  });

  const productIds = Items?.reduce((acc: Array<string>, curr) => {
    if (curr.entity === "ProductCategory") {
      acc.push(curr.productId);
    }

    return acc;
  }, []);

  const category = Items?.find((item) => item.entity === "Category") || {};
  category.productIds = productIds;

  if (include?.includes("products") && productIds?.length) {
    const { Responses } = await CatalogTable.batchGet(
      productIds?.map((productId) =>
        ProductEntity.getBatch({
          PK: `BUSINESS#${storeId}#STORE#${storeId}`,
          SK: `PRODUCT#${productId}`,
        })
      ) || []
    );

    category.products = Responses?.[tableName]?.map((item: any) =>
      Product.parse(item)
    );
  }

  return Category.extend({ products: z.array(Product).optional() }).parse(
    category
  );
}
