import { sql } from "../config/db.js";

// Get category breakdown (spending by category)
export async function getCategoryBreakdown(req, res) {
  try {
    const { userId } = req.params;
    const { period = "all" } = req.query; // all, month, week, year

    let categoryBreakdown;
    if (period === "month") {
      categoryBreakdown = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category
        ORDER BY total_amount ASC
      `;
    } else if (period === "week") {
      categoryBreakdown = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY category
        ORDER BY total_amount ASC
      `;
    } else if (period === "year") {
      categoryBreakdown = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
          AND created_at >= CURRENT_DATE - INTERVAL '365 days'
        GROUP BY category
        ORDER BY total_amount ASC
      `;
    } else {
      categoryBreakdown = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount,
          AVG(amount) as avg_amount
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
        GROUP BY category
        ORDER BY total_amount ASC
      `;
    }

    res.status(200).json(categoryBreakdown);
  } catch (error) {
    console.log("Error getting category breakdown", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get spending trends over time (daily, weekly, monthly)
export async function getSpendingTrends(req, res) {
  try {
    const { userId } = req.params;
    const { period = "month" } = req.query; // week, month, year

    let trends;
    if (period === "week") {
      trends = await sql`
        SELECT 
          DATE(created_at) as period,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
          SUM(amount) as net_balance
        FROM transactions 
        WHERE user_id = ${userId} 
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY period ASC
      `;
    } else if (period === "month") {
      trends = await sql`
        SELECT 
          DATE_TRUNC('week', created_at)::date as period,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
          SUM(amount) as net_balance
        FROM transactions 
        WHERE user_id = ${userId} 
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY period ASC
      `;
    } else if (period === "year") {
      trends = await sql`
        SELECT 
          DATE_TRUNC('month', created_at)::date as period,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
          SUM(amount) as net_balance
        FROM transactions 
        WHERE user_id = ${userId} 
          AND created_at >= CURRENT_DATE - INTERVAL '365 days'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY period ASC
      `;
    } else {
      trends = await sql`
        SELECT 
          DATE(created_at) as period,
          SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
          SUM(amount) as net_balance
        FROM transactions 
        WHERE user_id = ${userId}
        GROUP BY DATE(created_at)
        ORDER BY period ASC
      `;
    }

    res.status(200).json(trends);
  } catch (error) {
    console.log("Error getting spending trends", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get top spending categories
export async function getTopCategories(req, res) {
  try {
    const { userId } = req.params;
    const { limit = 5, period = "all" } = req.query;
    const limitNum = parseInt(limit) || 5;

    let topCategories;
    if (period === "month") {
      topCategories = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(ABS(amount)) as total_spent
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY category
        ORDER BY total_spent DESC
        LIMIT ${limitNum}
      `;
    } else if (period === "week") {
      topCategories = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(ABS(amount)) as total_spent
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY category
        ORDER BY total_spent DESC
        LIMIT ${limitNum}
      `;
    } else if (period === "year") {
      topCategories = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(ABS(amount)) as total_spent
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
          AND created_at >= CURRENT_DATE - INTERVAL '365 days'
        GROUP BY category
        ORDER BY total_spent DESC
        LIMIT ${limitNum}
      `;
    } else {
      topCategories = await sql`
        SELECT 
          category,
          COUNT(*) as transaction_count,
          SUM(ABS(amount)) as total_spent
        FROM transactions 
        WHERE user_id = ${userId} 
          AND amount < 0
        GROUP BY category
        ORDER BY total_spent DESC
        LIMIT ${limitNum}
      `;
    }

    res.status(200).json(topCategories);
  } catch (error) {
    console.log("Error getting top categories", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get monthly comparison (current month vs previous month)
export async function getMonthlyComparison(req, res) {
  try {
    const { userId } = req.params;

    const comparison = await sql`
      SELECT 
        DATE_TRUNC('month', created_at)::date as month,
        SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses,
        SUM(amount) as net_balance
      FROM transactions 
      WHERE user_id = ${userId} 
        AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 2
    `;

    const current = comparison[0] || { income: 0, expenses: 0, net_balance: 0 };
    const previous = comparison[1] || { income: 0, expenses: 0, net_balance: 0 };

    res.status(200).json({
      current: {
        month: current.month,
        income: parseFloat(current.income) || 0,
        expenses: parseFloat(current.expenses) || 0,
        net_balance: parseFloat(current.net_balance) || 0,
      },
      previous: {
        month: previous.month,
        income: parseFloat(previous.income) || 0,
        expenses: parseFloat(previous.expenses) || 0,
        net_balance: parseFloat(previous.net_balance) || 0,
      },
      changes: {
        income_change: (parseFloat(current.income) || 0) - (parseFloat(previous.income) || 0),
        expenses_change: (parseFloat(current.expenses) || 0) - (parseFloat(previous.expenses) || 0),
        balance_change: (parseFloat(current.net_balance) || 0) - (parseFloat(previous.net_balance) || 0),
      },
    });
  } catch (error) {
    console.log("Error getting monthly comparison", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get comprehensive analytics dashboard data
export async function getAnalyticsDashboard(req, res) {
  try {
    const { userId } = req.params;
    const { period = "month" } = req.query;

    let categoryBreakdown, trends, topCategories;
    
    if (period === "month") {
      [categoryBreakdown, trends, topCategories] = await Promise.all([
        sql`
          SELECT 
            category,
            COUNT(*) as transaction_count,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY category
          ORDER BY total_spent DESC
        `,
        sql`
          SELECT 
            DATE(created_at) as date,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses
          FROM transactions 
          WHERE user_id = ${userId} 
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,
        sql`
          SELECT 
            category,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
            AND created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY category
          ORDER BY total_spent DESC
          LIMIT 5
        `,
      ]);
    } else if (period === "week") {
      [categoryBreakdown, trends, topCategories] = await Promise.all([
        sql`
          SELECT 
            category,
            COUNT(*) as transaction_count,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY category
          ORDER BY total_spent DESC
        `,
        sql`
          SELECT 
            DATE(created_at) as date,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses
          FROM transactions 
          WHERE user_id = ${userId} 
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,
        sql`
          SELECT 
            category,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
            AND created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY category
          ORDER BY total_spent DESC
          LIMIT 5
        `,
      ]);
    } else if (period === "year") {
      [categoryBreakdown, trends, topCategories] = await Promise.all([
        sql`
          SELECT 
            category,
            COUNT(*) as transaction_count,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
            AND created_at >= CURRENT_DATE - INTERVAL '365 days'
          GROUP BY category
          ORDER BY total_spent DESC
        `,
        sql`
          SELECT 
            DATE_TRUNC('month', created_at)::date as date,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses
          FROM transactions 
          WHERE user_id = ${userId} 
            AND created_at >= CURRENT_DATE - INTERVAL '365 days'
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY date ASC
        `,
        sql`
          SELECT 
            category,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
            AND created_at >= CURRENT_DATE - INTERVAL '365 days'
          GROUP BY category
          ORDER BY total_spent DESC
          LIMIT 5
        `,
      ]);
    } else {
      [categoryBreakdown, trends, topCategories] = await Promise.all([
        sql`
          SELECT 
            category,
            COUNT(*) as transaction_count,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
          GROUP BY category
          ORDER BY total_spent DESC
        `,
        sql`
          SELECT 
            DATE(created_at) as date,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses
          FROM transactions 
          WHERE user_id = ${userId}
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `,
        sql`
          SELECT 
            category,
            SUM(ABS(amount)) as total_spent
          FROM transactions 
          WHERE user_id = ${userId} 
            AND amount < 0
          GROUP BY category
          ORDER BY total_spent DESC
          LIMIT 5
        `,
      ]);
    }

    // Calculate totals
    const totalIncome = trends.reduce((sum, t) => sum + (parseFloat(t.income) || 0), 0);
    const totalExpenses = trends.reduce((sum, t) => sum + (parseFloat(t.expenses) || 0), 0);
    const transactionCount = trends.reduce((sum, t) => sum + 1, 0);

    res.status(200).json({
      period,
      summary: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_balance: totalIncome - totalExpenses,
        transaction_count: transactionCount,
      },
      category_breakdown: categoryBreakdown,
      trends: trends,
      top_categories: topCategories,
    });
  } catch (error) {
    console.log("Error getting analytics dashboard", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
