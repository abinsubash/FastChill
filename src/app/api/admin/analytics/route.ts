import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";
import Bill from "@/models/bill";
import Complaint from "@/models/complaint";
import Brand from "@/models/brand";
import Category from "@/models/category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "month";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Fetch data in parallel for better performance
    const [
      allProducts,
      allBills,
      billsInRange,
      allComplaints,
      complaintsInRange,
      allBrands,
      allCategories,
    ] = await Promise.all([
      Product.find({ isActive: true }).populate("category", "name").populate("brand", "name").lean() as Promise<any[]>,
      Bill.find().lean() as Promise<any[]>,
      Bill.find({ createdAt: { $gte: startDate } }).lean() as Promise<any[]>,
      Complaint.find().lean() as Promise<any[]>,
      Complaint.find({ createdAt: { $gte: startDate } }).lean() as Promise<any[]>,
      Brand.find({ isActive: true }).lean() as Promise<any[]>,
      Category.find({ isActive: true }).lean() as Promise<any[]>,
    ]) as [any[], any[], any[], any[], any[], any[], any[]];
    // ============ REVENUE CALCULATIONS ============
    const totalRevenue = billsInRange.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setTime(previousPeriodStart.getTime() - (now.getTime() - startDate.getTime()));

    const previousBills = await Bill.find({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    }).lean();

    const previousRevenue = previousBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const revenueChange = previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : totalRevenue > 0 ? 100 : 0;

    // ============ ORDERS CALCULATIONS ============
    const totalOrders = billsInRange.length;
    const previousOrders = previousBills.length;
    const ordersChange = previousOrders > 0
      ? ((totalOrders - previousOrders) / previousOrders) * 100
      : totalOrders > 0 ? 100 : 0;

    // ============ CUSTOMERS CALCULATIONS ============
    const uniqueCustomers = new Set(
      billsInRange.map(bill => bill.customerPhone || bill.customerName)
    ).size;
    const previousCustomers = new Set(
      previousBills.map(bill => bill.customerPhone || bill.customerName)
    ).size;
    const customersChange = previousCustomers > 0
      ? ((uniqueCustomers - previousCustomers) / previousCustomers) * 100
      : uniqueCustomers > 0 ? 100 : 0;

    // ============ PRODUCTS SOLD CALCULATIONS ============
const productsSold = billsInRange.reduce(
  (sum: number, bill: any) => sum + bill.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
  0
);
const previousProductsSold = previousBills.reduce(
  (sum: number, bill: any) => sum + bill.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
  0
);
    const productsSoldChange = previousProductsSold > 0
      ? ((productsSold - previousProductsSold) / previousProductsSold) * 100
      : productsSold > 0 ? 100 : 0;

    // ============ COMPLAINTS CALCULATIONS ============
    const totalComplaints = complaintsInRange.length;
    const completedComplaints = complaintsInRange.filter(c => c.isComplete).length;
    const previousComplaintsData = await Complaint.find({
      createdAt: { $gte: previousPeriodStart, $lt: startDate }
    }).lean();
    const previousComplaints = previousComplaintsData.length;
    const complaintsChange = previousComplaints > 0
      ? ((totalComplaints - previousComplaints) / previousComplaints) * 100
      : totalComplaints > 0 ? 100 : 0;

    // ============ AVERAGE ORDER VALUE ============
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // ============ METRICS ARRAY ============
    const metrics = [
      {
        title: "Total Revenue",
        value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        change: parseFloat(revenueChange.toFixed(1)),
        trend: revenueChange >= 0 ? "up" : "down",
        color: "from-emerald-500 to-teal-600",
      },
      {
        title: "Total Orders",
        value: totalOrders.toLocaleString(),
        change: parseFloat(ordersChange.toFixed(1)),
        trend: ordersChange >= 0 ? "up" : "down",
        color: "from-blue-500 to-cyan-600",
      },
      {
        title: "Total Customers",
        value: uniqueCustomers.toLocaleString(),
        change: parseFloat(customersChange.toFixed(1)),
        trend: customersChange >= 0 ? "up" : "down",
        color: "from-purple-500 to-pink-600",
      },
      {
        title: "Products Sold",
        value: productsSold.toLocaleString(),
        change: parseFloat(productsSoldChange.toFixed(1)),
        trend: productsSoldChange >= 0 ? "up" : "down",
        color: "from-orange-500 to-red-600",
      },
      {
        title: "Service Requests",
        value: totalComplaints.toLocaleString(),
        change: parseFloat(complaintsChange.toFixed(1)),
        trend: complaintsChange >= 0 ? "up" : "down",
        color: "from-cyan-500 to-blue-600",
      },
      {
        title: "Avg. Order Value",
        value: `₹${averageOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        change: parseFloat(revenueChange.toFixed(1)), // Same as revenue change
        trend: revenueChange >= 0 ? "up" : "down",
        color: "from-yellow-500 to-orange-600",
      },
    ];

    // ============ SALES DATA FOR CHARTS ============
    const generateSalesData = () => {
      const labels: string[] = [];
      const revenueData: number[] = [];
      const ordersData: number[] = [];

      if (dateRange === "today") {
        // Hourly data for today
        for (let i = 0; i < 24; i++) {
          labels.push(`${i}:00`);
          const hourStart = new Date(now);
          hourStart.setHours(i, 0, 0, 0);
          const hourEnd = new Date(now);
          hourEnd.setHours(i, 59, 59, 999);

          const hourBills = billsInRange.filter(
            bill => new Date(bill.createdAt) >= hourStart && new Date(bill.createdAt) <= hourEnd
          );

          revenueData.push(hourBills.reduce((sum, bill) => sum + bill.grandTotal, 0));
          ordersData.push(hourBills.length);
        }
      } else if (dateRange === "week") {
        // Daily data for the week
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
          const dayStart = new Date(now);
          dayStart.setDate(now.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);

          labels.push(days[dayStart.getDay()]);

          const dayBills = billsInRange.filter(
            bill => new Date(bill.createdAt) >= dayStart && new Date(bill.createdAt) <= dayEnd
          );

          revenueData.push(dayBills.reduce((sum, bill) => sum + bill.grandTotal, 0));
          ordersData.push(dayBills.length);
        }
      } else if (dateRange === "month") {
        // Weekly data for the month
        for (let i = 3; i >= 0; i--) {
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - (i * 7 + 6));
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(now);
          weekEnd.setDate(now.getDate() - (i * 7));
          weekEnd.setHours(23, 59, 59, 999);

          labels.push(`Week ${4 - i}`);

          const weekBills = billsInRange.filter(
            bill => new Date(bill.createdAt) >= weekStart && new Date(bill.createdAt) <= weekEnd
          );

          revenueData.push(weekBills.reduce((sum, bill) => sum + bill.grandTotal, 0));
          ordersData.push(weekBills.length);
        }
      } else {
        // Monthly data for the year
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(now);
          monthStart.setMonth(now.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthStart.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);

          labels.push(months[monthStart.getMonth()]);

          const monthBills = billsInRange.filter(
            bill => new Date(bill.createdAt) >= monthStart && new Date(bill.createdAt) <= monthEnd
          );

          revenueData.push(monthBills.reduce((sum, bill) => sum + bill.grandTotal, 0));
          ordersData.push(monthBills.length);
        }
      }

      return {
        labels,
        datasets: [
          { label: "Revenue", data: revenueData, color: "#22d3ee" },
          { label: "Orders", data: ordersData, color: "#3b82f6" },
        ],
      };
    };

    // ============ TOP PRODUCTS ============
    // Calculate product sales from bills
    const productSalesMap = new Map();

    billsInRange.forEach(bill => {
      bill.items.forEach((item:any) => {
        const productId = item.product.toString();
        if (!productSalesMap.has(productId)) {
          productSalesMap.set(productId, {
            id: productId,
            name: item.name,
            sales: 0,
            revenue: 0,
            quantity: 0
          });
        }
        const productData = productSalesMap.get(productId);
        productData.sales += 1;
        productData.quantity += item.quantity;
        productData.revenue += item.total;
      });
    });

    // Get product details and merge with sales data
    const topProductsData = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const topProducts = await Promise.all(
      topProductsData.map(async (productData) => {
        const product = allProducts.find(p => p._id.toString() === productData.id);
        return {
          id: productData.id,
          name: productData.name,
          sales: productData.quantity,
          revenue: productData.revenue,
          stock: product?.stock || 0,
          image: product?.images?.[0] || '/placeholder.jpg',
          brand: product?.brand?.name || 'No Brand',
          category: product?.category?.name || 'Uncategorized',
        };
      })
    );

    // ============ CATEGORY DISTRIBUTION ============
    const categoryMap = new Map();

    billsInRange.forEach(bill => {
      bill.items.forEach((item:any) => {
        const productId = item.product.toString();
        const product = allProducts.find(p => p._id.toString() === productId);
        const categoryName = product?.category?.name || 'Others';

        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + item.quantity);
      });
    });

    const totalCategorySales = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    const categoryColors = ['#22d3ee', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#10b981', '#f59e0b'];
    const categoryData = Array.from(categoryMap.entries())
      .map(([name, count], index) => ({
        name,
        value: totalCategorySales > 0 ? Math.round((count / totalCategorySales) * 100) : 0,
        count,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // ============ RECENT ORDERS ============
    const recentOrders = billsInRange
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(bill => ({
        id: bill.billNumber,
        customer: bill.customerName,
        service: `${bill.items.length} item(s)`,
        status: bill.paymentStatus === 'paid' ? 'completed' : 'pending',
        amount: bill.grandTotal,
        date: new Date(bill.createdAt).toISOString().split('T')[0],
        paymentMethod: bill.paymentMethod,
      }));

    // ============ RECENT COMPLAINTS ============
    const recentComplaints = complaintsInRange
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(complaint => ({
        id: complaint._id.toString().slice(-8).toUpperCase(),
        customer: complaint.fullName,
        service: `${complaint.brand} - ${complaint.category}`,
        status: complaint.isComplete ? 'completed' : 'pending',
        amount: 0,
        date: new Date(complaint.createdAt).toISOString().split('T')[0],
        phone: complaint.primaryContactNumber,
        description: complaint.problemDescription,
      }));

    // ============ INVENTORY INSIGHTS ============
    const totalProducts = allProducts.length;
    const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProducts = allProducts.filter(p => p.stock < 10 && p.stock > 0).length;
    const outOfStockProducts = allProducts.filter(p => p.stock === 0).length;

    const inventoryInsights = {
      totalProducts,
      totalStock,
      lowStockProducts,
      outOfStockProducts,
      averageStockPerProduct: totalProducts > 0 ? Math.round(totalStock / totalProducts) : 0,
      stockValue: allProducts.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0),
    };

    // ============ PAYMENT METHOD DISTRIBUTION ============
    const paymentMethodMap = new Map();
    billsInRange.forEach(bill => {
      paymentMethodMap.set(
        bill.paymentMethod,
        (paymentMethodMap.get(bill.paymentMethod) || 0) + 1
      );
    });

    const paymentMethodData = Array.from(paymentMethodMap.entries()).map(([method, count]) => ({
      method: method.toUpperCase(),
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
    }));

    // ============ BRAND PERFORMANCE ============
    const brandMap = new Map();

    billsInRange.forEach(bill => {
      bill.items.forEach((item:any) => {
        const productId = item.product.toString();
        const product = allProducts.find(p => p._id.toString() === productId);
        const brandName = product?.brand?.name || 'Unknown';

        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, { sales: 0, revenue: 0 });
        }
        const brandData = brandMap.get(brandName);
        brandData.sales += item.quantity;
        brandData.revenue += item.total;
      });
    });

    const brandPerformance = Array.from(brandMap.entries())
      .map(([name, data]) => ({
        brand: name,
        sales: data.sales,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json(
      {
        success: true,
        data: {
          metrics,
          salesData: generateSalesData(),
          topProducts,
          categoryData,
          recentOrders,
          recentComplaints,
          inventoryInsights,
          paymentMethodData,
          brandPerformance,
          dateRange,
          summary: {
            totalBills: allBills.length,
            totalComplaints: allComplaints.length,
            completedComplaints,
            pendingComplaints: totalComplaints - completedComplaints,
            totalBrands: allBrands.length,
            totalCategories: allCategories.length,
          }
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}