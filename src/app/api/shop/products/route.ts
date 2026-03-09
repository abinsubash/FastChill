import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";
// Static imports so Mongoose registers schemas BEFORE any .populate() runs
import Category from "@/models/category";
import Brand from "@/models/brand";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search     = searchParams.get("search") || "";
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const brands     = searchParams.get("brands")?.split(",").filter(Boolean) || [];
    const minPrice   = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice   = parseFloat(searchParams.get("maxPrice") || "999999999");
    const inStock    = searchParams.get("inStock") === "true";
    const sortBy     = searchParams.get("sortBy") || "featured";
    const page       = parseInt(searchParams.get("page") || "1");
    const limit      = parseInt(searchParams.get("limit") || "20");

    // Build query
    const query: any = { isActive: true };

    if (search.trim()) {
      query.$or = [
        { name:        { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (categories.length > 0) query.category = { $in: categories };
    if (brands.length > 0)     query.brand     = { $in: brands };

    query.sellingPrice = { $gte: minPrice, $lte: maxPrice };

    if (inStock) query.stock = { $gt: 0 };

    // Build sort
    const sortMap: Record<string, object> = {
      "price-low":  { sellingPrice: 1 },
      "price-high": { sellingPrice: -1 },
      "name":       { name: 1 },
      "newest":     { createdAt: -1 },
    };
    const sort = sortMap[sortBy] ?? { createdAt: -1 };

    const skip = (page - 1) * limit;

    // Main query + total count in parallel
    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .populate("brand", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Filter options
    const [availableCategoryIds, availableBrandIds, priceRange] = await Promise.all([
      Product.distinct("category", { isActive: true }),
      Product.distinct("brand",    { isActive: true }),
      Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            minPrice: { $min: "$sellingPrice" },
            maxPrice: { $max: "$sellingPrice" },
          },
        },
      ]),
    ]);

    const [categoryDocs, brandDocs] = await Promise.all([
      Category.find({ _id: { $in: availableCategoryIds }, isActive: true }).select("_id name").lean(),
      Brand.find({    _id: { $in: availableBrandIds },    isActive: true }).select("_id name").lean(),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage:     page,
        totalPages:      Math.ceil(totalCount / limit),
        totalProducts:   totalCount,
        productsPerPage: limit,
        hasNextPage:     page * limit < totalCount,
        hasPrevPage:     page > 1,
      },
      filters: {
        categories: categoryDocs.map((c: any) => ({ id: c._id, name: c.name })),
        brands:     brandDocs.map((b: any)    => ({ id: b._id, name: b.name })),
        priceRange: {
          min: priceRange[0]?.minPrice ?? 0,
          max: priceRange[0]?.maxPrice ?? 0,
        },
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch products",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}