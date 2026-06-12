import { prisma } from "../config/db.js";
import { NotFoundError } from "../utils/errors.js";
import {
  type CreateProductInput,
  type UpdateProductInput,
  type ProductQueryParams,
  type ProductResponse,
  type PaginatedProductsResponse,
  mapProductToResponse,
} from "../models/product.model.js";

export class ProductService {
  async getAllProducts(
    params: ProductQueryParams,
  ): Promise<PaginatedProductsResponse> {
    const whereClause: any = {};

    if (params.search) {
      const searchStr = params.search;
      whereClause.OR = [
        { name: { contains: searchStr, mode: "insensitive" } },
        { description: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    if (params.category) {
      const categoryStr = params.category;
      whereClause.category = {
        name: { equals: categoryStr, mode: "insensitive" },
      };
    }

    if (params.minPrice || params.maxPrice) {
      whereClause.price = {};
      if (params.minPrice) {
        const minVal = parseFloat(params.minPrice);
        if (!isNaN(minVal)) {
          whereClause.price.gte = minVal;
        }
      }
      if (params.maxPrice) {
        const maxVal = parseFloat(params.maxPrice);
        if (!isNaN(maxVal)) {
          whereClause.price.lte = maxVal;
        }
      }
    }

    if (params.inStock !== undefined) {
      const checkStock = params.inStock === "true";
      if (checkStock) {
        whereClause.stock = { gt: 0 };
      } else {
        whereClause.stock = { equals: 0 };
      }
    }

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(params.page || "1", 10) || 1);
    const limitNum = Math.max(1, parseInt(params.limit || "10", 10) || 10);
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    return {
      products: products.map(mapProductToResponse),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async getProductById(id: string): Promise<ProductResponse> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    return mapProductToResponse(product);
  }

  async createProduct(input: CreateProductInput): Promise<ProductResponse> {
    const categoryRecord = await prisma.category.upsert({
      where: { name: input.category },
      update: {},
      create: { name: input.category },
    });

    const product = await prisma.product.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        stock: input.stock,
        imageUrl: input.imageUrl ?? null,
        categoryId: categoryRecord.id,
      },
      include: {
        category: true,
      },
    });

    return mapProductToResponse(product);
  }

  async updateProduct(
    id: string,
    input: UpdateProductInput,
  ): Promise<ProductResponse> {
    const existing = await prisma.product.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    let categoryId: string | undefined;
    if (input.category) {
      const categoryRecord = await prisma.category.upsert({
        where: { name: input.category },
        update: {},
        create: { name: input.category },
      });
      categoryId = categoryRecord.id;
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.stock !== undefined) updateData.stock = input.stock;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return mapProductToResponse(updated);
  }

  async deleteProduct(id: string): Promise<ProductResponse> {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
    if (!existing) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    await prisma.product.delete({
      where: { id },
    });

    return mapProductToResponse(existing);
  }
}

export const productService = new ProductService();
