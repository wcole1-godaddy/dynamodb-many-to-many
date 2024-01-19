import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity, Table } from "dynamodb-toolbox";

const marshallOptions = {
  convertEmptyValues: false,
};

const translateConfig = { marshallOptions };

export const DocumentClient = DynamoDBDocumentClient.from(
  new DynamoDBClient(),
  translateConfig
);

export const tableName = "wes-playground";

export const CatalogTable = new Table({
  name: tableName,
  partitionKey: "PK",
  sortKey: "SK",
  indexes: {
    GSI1: { partitionKey: "PK1", sortKey: "SK1" },
  },
  DocumentClient,
});

export const ProductEntity = new Entity({
  name: "Product",
  created: "createdAt",
  createdAlias: "createdAt",
  modified: "updatedAt",
  modifiedAlias: "updatedAt",
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    PK1: { type: "string" },
    SK1: { type: "string" },
    id: { type: "string" },
    storeId: { type: "string" },
    name: { type: "string" },
  },
  table: CatalogTable,
});

export const CategoryEntity = new Entity({
  name: "Category",
  created: "createdAt",
  createdAlias: "createdAt",
  modified: "updatedAt",
  modifiedAlias: "updatedAt",
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    PK1: { type: "string" },
    SK1: { type: "string" },
    id: { type: "string" },
    storeId: { type: "string" },
    name: { type: "string" },
  },
  table: CatalogTable,
});

export const ProductCategoryEntity = new Entity({
  name: "ProductCategory",
  created: "createdAt",
  createdAlias: "createdAt",
  modified: "updatedAt",
  modifiedAlias: "updatedAt",
  attributes: {
    PK: { partitionKey: true },
    SK: { sortKey: true },
    PK1: { type: "string" },
    SK1: { type: "string" },
    productId: { type: "string" },
    categoryId: { type: "string" },
  },
  table: CatalogTable,
});
