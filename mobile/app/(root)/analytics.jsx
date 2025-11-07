import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  PieChart,
  LineChart,
  BarChart,
} from "react-native-chart-kit";
import { useAnalytics } from "../../hooks/useAnalytics";
import { COLORS } from "../../constants/colors";
import { styles } from "../../assets/styles/analytics.styles";

// Compute a safe chart width to avoid NaN/negative values used by the chart lib
const windowDims = Dimensions.get("window");
const screenWidth = windowDims && windowDims.width ? windowDims.width : 360;
const chartWidth = Math.max(200, Math.floor(screenWidth - 40));

const PERIODS = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
  { label: "All", value: "all" },
];

export default function AnalyticsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation();

  const { analytics, isLoading, fetchAnalytics } = useAnalytics(user?.id);

  useEffect(() => {
    if (user?.id) {
      fetchAnalytics(selectedPeriod);
    }
  }, [user?.id, selectedPeriod, fetchAnalytics]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics(selectedPeriod);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return "0%";
    return `${((Math.abs(value) / total) * 100).toFixed(1)}%`;
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!analytics) return null;

    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // Pie chart data for categories (react-native-chart-kit expects `population` by default)
    const pieRaw = analytics.category_breakdown?.slice(0, 6).map((item, index) => {
      const colors = [
        COLORS.expense,
        "#FF6B6B",
        "#4ECDC4",
        "#FFE66D",
        "#95E1D3",
        "#F38181",
        "#AA96DA",
      ];
      return {
        name: item.category,
        population: Math.abs(toNumber(item.total_spent)),
        color: colors[index % colors.length],
        legendFontColor: COLORS.text,
        legendFontSize: 12,
      };
    }) || [];

    // Filter out zeros and invalid values to prevent NaN in pie path calculations
    const pieData = pieRaw.filter((p) => Number.isFinite(p.population) && p.population > 0);
    const pieTotal = pieData.reduce((sum, p) => sum + p.population, 0);

    // Line chart data for trends
    const trendLabels = analytics.trends?.slice(-7).map((trend) => {
      const date = new Date(trend.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }) || [];
    
    const incomeData = (analytics.trends?.slice(-7).map((t) => toNumber(t.income)) || []).map(
      (n) => (Number.isFinite(n) ? n : 0)
    );
    const expenseData = (analytics.trends?.slice(-7).map((t) => toNumber(t.expenses)) || []).map(
      (n) => (Number.isFinite(n) ? n : 0)
    );

    // Bar chart data for income vs expenses
    const barData = {
      labels: trendLabels,
      datasets: [
        {
          data: incomeData,
        },
        {
          data: expenseData,
        },
      ],
    };

    return {
      pieData,
      pieTotal,
      trendLabels,
      incomeData,
      expenseData,
      barData,
    };
  }, [analytics]);

  const chartConfig = {
    backgroundColor: COLORS.card,
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    decimalPlaces: 0,
    color: (opacity = 1) => COLORS.text,
    labelColor: (opacity = 1) => COLORS.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.primary,
    },
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("analyticsTitle")}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("analyticsTitle")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                selectedPeriod === period.value && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period.value && styles.periodButtonTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {analytics ? (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t("totalIncome")}</Text>
                <Text style={[styles.summaryValue, { color: COLORS.income }]}>
                  {formatCurrency(analytics.summary.total_income)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t("totalExpenses")}</Text>
                <Text style={[styles.summaryValue, { color: COLORS.expense }]}>
                  {formatCurrency(analytics.summary.total_expenses)}
                </Text>
              </View>
            </View>

            <View style={styles.netBalanceCard}>
              <Text style={styles.netBalanceLabel}>{t("netBalance")}</Text>
              <Text
                style={[
                  styles.netBalanceValue,
                  {
                    color:
                      analytics.summary.net_balance >= 0 ? COLORS.income : COLORS.expense,
                  },
                ]}
              >
                {formatCurrency(analytics.summary.net_balance)}
              </Text>
            </View>

            {/* Category Pie Chart */}
            {chartData && chartData.pieData.length > 0 && chartData.pieTotal > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="pie-chart" size={18} color={COLORS.text} /> {t("spendingByCategory")}
                </Text>
                <View style={styles.chartContainer}>
                  <PieChart
                    data={chartData.pieData}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      // Hide numeric labels drawn on slices so only legend shows names
                      color: () => "transparent",
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    hasLegend
                  />
                </View>
              </View>
            )}

            {/* Top Categories */}
            {analytics.top_categories && analytics.top_categories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="pricetag" size={18} color={COLORS.text} /> {t("topCategories")}
                </Text>
                <View style={styles.categoriesList}>
                  {analytics.top_categories.map((category, index) => {
                    const percentage = formatPercentage(
                      category.total_spent,
                      analytics.summary.total_expenses
                    );
                    return (
                      <View key={index} style={styles.categoryItem}>
                        <View style={styles.categoryInfo}>
                          <Text style={styles.categoryName}>{category.category}</Text>
                          <Text style={styles.categoryPercentage}>{percentage}</Text>
                        </View>
                        <Text style={styles.categoryAmount}>
                          {formatCurrency(category.total_spent)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Category Breakdown */}
            {analytics.category_breakdown && analytics.category_breakdown.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="pie-chart" size={18} color={COLORS.text} /> Category Breakdown
                </Text>
                <View style={styles.breakdownList}>
                  {analytics.category_breakdown.map((item, index) => {
                    const percentage = formatPercentage(
                      item.total_spent,
                      analytics.summary.total_expenses
                    );
                    const barWidth = `${(Math.abs(item.total_spent) / analytics.summary.total_expenses) * 100}%`;
                    return (
                      <View key={index} style={styles.breakdownItem}>
                        <View style={styles.breakdownHeader}>
                          <Text style={styles.breakdownCategory}>{item.category}</Text>
                          <Text style={styles.breakdownAmount}>
                            {formatCurrency(item.total_spent)}
                          </Text>
                        </View>
                        <View style={styles.barContainer}>
                          <View
                            style={[
                              styles.bar,
                              { width: barWidth, backgroundColor: COLORS.expense },
                            ]}
                          />
                        </View>
                        <View style={styles.breakdownFooter}>
                          <Text style={styles.breakdownCount}>
                            {item.transaction_count} transactions
                          </Text>
                          <Text style={styles.breakdownPercentage}>{percentage}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Income/Expenses bar trends removed as requested */}

            {/* Spending Trends Line Chart */}
            {chartData && chartData.trendLabels.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="trending-up" size={18} color={COLORS.text} /> {t("spendingTrends")}
                </Text>
                <View style={styles.chartContainer}>
                  <LineChart
                    data={{
                      labels: chartData.trendLabels,
                      datasets: [
                        {
                          data: chartData.incomeData,
                          color: (opacity = 1) => COLORS.income,
                          strokeWidth: 2,
                        },
                        {
                          data: chartData.expenseData,
                          color: (opacity = 1) => COLORS.expense,
                          strokeWidth: 2,
                        },
                      ],
                      legend: ["Income", "Expenses"],
                    }}
                    width={chartWidth}
                    height={220}
                    chartConfig={{
                      ...chartConfig,
                      color: (opacity = 1) => COLORS.text,
                      labelColor: (opacity = 1) => COLORS.text,
                      strokeWidth: 2,
                    }}
                    bezier
                    style={styles.chart}
                    withInnerLines={false}
                    withOuterLines={true}
                    withVerticalLines={false}
                    withHorizontalLines={true}
                    withDots={true}
                    withShadow={false}
                  />
                </View>
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.income }]} />
                    <Text style={styles.legendText}>Income</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.expense }]} />
                    <Text style={styles.legendText}>Expenses</Text>
                  </View>
                </View>
              </View>
            )}

            {(!analytics.category_breakdown || analytics.category_breakdown.length === 0) &&
              (!analytics.trends || analytics.trends.length === 0) && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="analytics-outline" size={64} color={COLORS.textLight} />
                  <Text style={styles.emptyText}>No data available for this period</Text>
                </View>
              )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No analytics data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

