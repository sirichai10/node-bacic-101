import type { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service.js";
import {
  createProductSchema,
  updateProductSchema,
  type ProductQueryParams,
} from "../models/product.model.js";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const queryParams: ProductQueryParams = req.query;
    const { products, total, page, limit, totalPages } = await productService.getAllProducts(queryParams);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id as string);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedData = createProductSchema.parse(req.body);
    const newProduct = await productService.createProduct(validatedData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);
    const updatedProduct = await productService.updateProduct(id as string, validatedData);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedProduct = await productService.deleteProduct(id as string);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};
