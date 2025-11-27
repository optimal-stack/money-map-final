[5 tools called]

Here’s a detailed README you can paste into your `README.md` (or into a new file). It’s tailored to your current codebase.

---

### Wallet App – Full-Stack Expense Tracker

This project is a full-stack expense tracking application:

- **Mobile app**: Expo + React Native (`mobile/`)
- **Backend API**: Node.js + Express + PostgreSQL on Neon (`backend/`)
- **Auth**: Clerk (via `@clerk/clerk-expo`)
- **Analytics**: SQL-based analytics on the backend, visualized with charts on the mobile app

---

## Tech Stack Overview

### **Mobile (Frontend)**

- **React Native + Expo**
  - **Packages**: `expo`, `react-native`, `expo-router`
  - **What**: Cross-platform UI framework for building iOS/Android apps with JavaScript/TypeScript.
  - **How**:  
    - Screens live in `mobile/app/`:
      - `mobile/app/(auth)/sign-in.jsx`, `sign-up.jsx`: auth screens
      - `mobile/app/(root)/index.jsx`: home / transactions list
      - `mobile/app/(root)/create.jsx`: create transaction
      - `mobile/app/(root)/analytics.jsx`: analytics dashboard
    - `expo-router` provides file-based routing and navigation.

- **Clerk for Authentication**
  - **Package**: `@clerk/clerk-expo`
  - **What**: Hosted authentication service providing sign-up, sign-in, sessions, and user management.
  - **How**:
    - Global provider in `mobile/app/_layout.jsx`:

      ```8:15:mobile/app/_layout.jsx
      export default function RootLayout() {
        return (
          <ClerkProvider tokenCache={tokenCache}>
            <SafeScreen>
              <Slot />
            </SafeScreen>
            <StatusBar style="dark" />
          </ClerkProvider>
        );
      }
      ```

    - Auth routing guard in `mobile/app/(auth)/_layout.jsx`:

      ```1:9:mobile/app/(auth)/_layout.jsx
      import { useAuth } from "@clerk/clerk-expo";
      ...
      const { isSignedIn } = useAuth();
      if (isSignedIn) return <Redirect href={"/"} />;
      ```

    - **Sign-in** flow (`useSignIn`) in `sign-in.jsx` and **sign-up + email verification** (`useSignUp`) in `sign-up.jsx`.

- **Charts / Analytics Visualization**
  - **Package**: `react-native-chart-kit`
  - **What**: Charting library for React Native.
  - **How**: Used in `mobile/app/(root)/analytics.jsx` to render:
    - **Pie chart** for category spending
    - **Line chart** for income vs expense trends

- **i18n (Localization)**
  - **Packages**: `i18next`, `react-i18next`
  - **What**: Internationalization (multi-language support).
  - **How**: Initialized in `mobile/i18n/index.js` and used with `useTranslation` hook in screens like `index.jsx` and `analytics.jsx`.

- **Other UI / UX helpers**
  - `@expo/vector-icons`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`, `expo-image`, `expo-status-bar`, `expo-blur`
  - `react-native-keyboard-aware-scroll-view` for better keyboard handling on forms.

---

### **Backend (API)**

- **Node.js + Express**
  - **Package**: `express`
  - **What**: HTTP API server.
  - **How**:
    - Entry point: `backend/src/server.js`
    - Registers:
      - `/api/transactions` → `backend/src/routes/transactionsRoute.js`
      - `/api/analytics` → `backend/src/routes/analyticsRoute.js`
    - Also exposes `/api/health` for health checks.

- **PostgreSQL (Database) on Neon**
  - **Package**: `@neondatabase/serverless`
  - **What**: Serverless Postgres database client for Neon.
  - **How**:
    - Connection created in `backend/src/config/db.js`:

      ```1:8:backend/src/config/db.js
      import { neon } from "@neondatabase/serverless";

      import "dotenv/config";

      // Creates a SQL connection using our DB URL
      export const sql = neon(process.env.DATABASE_URL);
      ```

    - `initDB()` creates the `transactions` table if it doesn’t exist:

      ```9:19:backend/src/config/db.js
      export async function initDB() {
        await sql`CREATE TABLE IF NOT EXISTS transactions(
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          title  VARCHAR(255) NOT NULL,
          amount  DECIMAL(10,2) NOT NULL,
          category VARCHAR(255) NOT NULL,
          festival VARCHAR(255),
          created_at DATE NOT NULL DEFAULT CURRENT_DATE
        )`;
      }
      ```

    - `initDB()` is called from `server.js` before starting the server.

- **Rate Limiting & Redis (Upstash)**
  - **Packages**: `@upstash/redis`, `@upstash/ratelimit`
  - **What**: Distributed rate limiting backed by Upstash Redis.
  - **How**:
    - Config in `backend/src/config/upstash.js`:

      ```1:9:backend/src/config/upstash.js
      import { Redis } from "@upstash/redis";
      import { Ratelimit } from "@upstash/ratelimit";

      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(100, "60 s"),
      });
      ```

    - Middleware in `backend/src/middleware/rateLimiter.js`:

      ```1:13:backend/src/middleware/rateLimiter.js
      import ratelimit from "../config/upstash.js";

      const rateLimiter = async (req, res, next) => {
        const { success } = await ratelimit.limit("my-rate-limit");
        if (!success) {
          return res.status(429).json({
            message: "Too many requests, please try again later.",
          });
        }
        next();
      };
      ```

    - Applied globally in `server.js`:

      ```17:21:backend/src/server.js
      app.use(cors());
      app.use(rateLimiter);
      app.use(express.json());
      ```

- **Environment / Infra**
  - `dotenv` for loading environment variables.
  - `cron` (in `backend/src/config/cron.js`) for scheduled jobs (e.g. periodic tasks).
  - `cors` to allow cross-origin requests from the mobile app.

---

### **How the Database Connection Works**

1. **Configuration**:
   - You provide a Postgres connection string via `DATABASE_URL` in the backend `.env`.
   - Example: `postgres://user:password@host:port/dbname`.

2. **Initialization**:
   - `neon(process.env.DATABASE_URL)` in `db.js` creates a `sql` tagged template function used for all queries.
   - `initDB()` is called in `server.js`:

     ```34:45:backend/src/server.js
     app.use("/api/transactions", transactionsRoute);
     app.use("/api/analytics", analyticsRoute);

     initDB()
       .then(() => {
         app.listen(PORT, "0.0.0.0", () => {
           console.log("Server is up and running!");
         });
       })
       .catch((error) => {
         ...
       });
     ```

3. **Per-request usage**:
   - Controllers use `sql` for queries, e.g. in `transactionsController.js`:

     ```18:31:backend/src/controllers/transactionsController.js
     export async function createTransaction(req, res) {
       const { title, amount, category, user_id, festival } = req.body;

       const transaction = await sql`
         INSERT INTO transactions(user_id,title,amount,category,festival)
         VALUES (${user_id},${title},${amount},${category},${festival || null})
         RETURNING *
       `;
       res.status(201).json(transaction[0]);
     }
     ```

4. **Data model**:
   - `transactions` table holds all user financial data:
     - `user_id` (string from Clerk user ID)
     - `title`, `amount`, `category`, optional `festival`, `created_at`.

---

### **How Authentication Works (Clerk)**

#### On the Mobile App

- `ClerkProvider` wraps the whole app in `mobile/app/_layout.jsx`.
- Auth flows:
  - **Sign-up**:
    - `useSignUp` in `sign-up.jsx`:
      - `signUp.create({ emailAddress, password })`
      - Sends verification code via `signUp.prepareEmailAddressVerification({ strategy: "email_code" })`
      - Verifies code with `signUp.attemptEmailAddressVerification({ code })`
      - On success, sets session active with `setActive({ session: signUpAttempt.createdSessionId })`.
  - **Sign-in**:
    - `useSignIn` in `sign-in.jsx`:
      - `signIn.create({ identifier: emailAddress, password })`
      - On `status === "complete"`, calls `setActive({ session: signInAttempt.createdSessionId })`.

- Auth state and user info:
  - `useAuth()` to check `isSignedIn` (used to redirect away from auth routes if already signed in).
  - `useUser()` to access user details (e.g. `user.id`, `user.firstName`) used in `index.jsx`, `analytics.jsx`, etc.

#### On the Backend

- **Important**: The backend does **not** currently verify Clerk JWTs or sessions.
- Instead:
  - The frontend sends the **Clerk `user.id`** as a simple `userId` path parameter or `user_id` in the request body.
  - Backend controllers use this `userId` to scope DB queries.

Examples:

- Fetch transactions for a user:
  ```107:113:backend/src/controllers/transactionsController.js
  const { userId } = req.params;
  const balanceResult = await sql`
    SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
  `;
  ```

- Create transaction:
  ```20:28:backend/src/controllers/transactionsController.js
  const { title, amount, category, user_id, festival } = req.body;
  INSERT INTO transactions(user_id,title,amount,category,festival) VALUES (${user_id},...);
  ```

#### Short answer: Where Clerk “connects” to the database

- The **only connection** between Clerk and the database is the **`user_id` string**:
  - Clerk provides `user.id` in the mobile app via `useUser()`.
  - That `user.id` is sent with API requests (`user_id` / `userId`).
  - The backend stores this `user_id` in the `transactions` table and uses it in `WHERE user_id = ${userId}` queries.
- There is **no direct integration** (yet) like verifying Clerk tokens server-side; it’s an implicit link via the user ID.

---

### **Role of Render**

- In `mobile/constants/api.js` you have commented URLs pointing to Render:

  ```1:2:mobile/constants/api.js
  //export const API_URL = "https://wallet-api-cxqp.onrender.com/api";
  //export const API_URL = "https://money-map-84sq.onrender.com/api";
  ```

- **Render** is a cloud hosting platform used to deploy the **backend API**:
  - You deploy the Express server there.
  - Render provides a public URL (e.g. `https://wallet-api-xxxx.onrender.com`).
  - The mobile app’s `API_URL` is set to this value (or to a local IP for development) so the app can call the backend from any device.

---

## Backend Architecture: Middleware, Controllers, and Rate Limiter

### **Middleware**

- **CORS middleware**:
  - `cors()` in `server.js` allows the mobile app to call the API from a different origin.

- **JSON body parser**:
  - `express.json()` parses incoming JSON request bodies.

- **Rate Limiter**:
  - `rateLimiter` is applied globally in `server.js`:
    ```17:21:backend/src/server.js
    app.use(cors());
    app.use(rateLimiter);  // Upstash-based rate limiting
    app.use(express.json());
    ```

  - **Why it’s needed**:
    - Prevents abuse / accidental flooding of the API (e.g. infinite retry loops, malicious DoS).
    - Protects resource usage and stays within Upstash/Neon limits.

  - **How it works**:
    - Each incoming request triggers `ratelimit.limit("my-rate-limit")`.
    - Under the default config, only **100 requests per 60 seconds** (per key) are allowed.
    - If the limit is exceeded, the API returns **HTTP 429** with a “Too many requests” message.

### **Controllers**

1. **Transactions Controller** (`backend/src/controllers/transactionsController.js`)
   - **Endpoints via `transactionsRoute.js`**:
     - `GET /api/transactions/:userId` → `getTransactionsByUserId`
     - `POST /api/transactions` → `createTransaction`
     - `DELETE /api/transactions/:id` → `deleteTransaction`
     - `GET /api/transactions/summary/:userId` → `getSummaryByUserId`
     - `GET /api/transactions/festival/:festival/:userId` → `getTransactionsByFestival`
     - `GET /api/transactions/festival-summary/:festival/:userId` → `getFestivalSummary`

   - **Responsibilities**:
     - CRUD operations on the `transactions` table.
     - Calculate aggregate metrics like income, expenses, net balance.
     - Provide filtered views (e.g. per festival).

2. **Analytics Controller** (`backend/src/controllers/analyticsController.js`)
   - **Endpoints via `analyticsRoute.js`**:
     - `GET /api/analytics/category-breakdown/:userId`
     - `GET /api/analytics/trends/:userId`
     - `GET /api/analytics/top-categories/:userId`
     - `GET /api/analytics/monthly-comparison/:userId`
     - `GET /api/analytics/dashboard/:userId`

   - **Responsibilities**:
     - Higher-level analytics over transactions:
       - Category breakdown
       - Time-based trends
       - Top spending categories
       - Month-over-month comparisons
       - Combined “dashboard” summary

---

## How Analytics Works (in Detail)

### 1. Backend Analytics Logic (SQL on Postgres)

All analytics are calculated with **SQL queries on the `transactions` table** in `analyticsController.js`.

Key functions:

- **Category Breakdown** (`getCategoryBreakdown`)
  - For a given `userId` and `period` (`week`, `month`, `year`, `all`):
    - Filters rows by `user_id` and time.
    - Considers only **expenses** (`amount < 0`).
    - Computes:
      - `transaction_count`
      - `total_amount` (sum of amounts)
      - `avg_amount`
    - Groups by `category`.

- **Spending Trends** (`getSpendingTrends`)
  - Returns time-series data:
    - `period` (date / week / month)
    - `income` (sum of `amount > 0`)
    - `expenses` (sum of `ABS(amount)` for `amount < 0`)
    - `net_balance` (sum of `amount`)
  - Uses different `DATE_TRUNC` / ranges based on the requested `period`.

- **Top Categories** (`getTopCategories`)
  - For a given `period`, returns top N categories ranked by `SUM(ABS(amount))` where `amount < 0`.

- **Monthly Comparison** (`getMonthlyComparison`)
  - Aggregates per month for the last two months.
  - Returns **current** vs **previous** month income, expenses, net balance, and their differences.

- **Analytics Dashboard** (`getAnalyticsDashboard`)
  - For a given `period`, runs three queries in parallel with `Promise.all`:
    - Category breakdown (`category`, `transaction_count`, `total_spent`)
    - Trends (date vs income/expenses)
    - Top categories (limited to top 5)
  - Computes:
    - `total_income` and `total_expenses` by summing trend values.
    - `net_balance = total_income - total_expenses`.
    - `transaction_count` (number of trend points).
  - Returns a combined JSON:

    ```424:435:backend/src/controllers/analyticsController.js
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
    ```

### 2. Frontend Analytics Consumption (Hooks & Charts)

- **Hook**: `mobile/hooks/useAnalytics.js`
  - Wraps all analytics API calls:
    - `fetchAnalytics(period)` → `/analytics/dashboard/:userId?period=...`
    - `fetchCategoryBreakdown(period)`
    - `fetchSpendingTrends(period)`
    - `fetchMonthlyComparison()`
  - Stores the analytics dashboard in local state (`analytics`, `isLoading`, `error`).

- **Analytics Screen**: `mobile/app/(root)/analytics.jsx`
  - Uses:
    - `const { user } = useUser();`
    - `const { analytics, isLoading, fetchAnalytics } = useAnalytics(user?.id);`
  - On mount / when `selectedPeriod` changes, calls `fetchAnalytics(selectedPeriod)` to refresh data.
  - Prepares chart data with `useMemo()`:
    - **Pie chart**:
      - Uses `analytics.category_breakdown` to build chart data for `react-native-chart-kit`’s `PieChart`.
    - **Line chart**:
      - Uses `analytics.trends` to create labels and datasets for `LineChart`.

- **Libraries used for analytics UI**:
  - `react-native-chart-kit` (PieChart, LineChart, BarChart — though bar chart is currently not rendered).
  - `react-native` components like `ScrollView`, `TouchableOpacity`, etc.
  - `i18next`/`react-i18next` for translated labels (e.g. “Total Income”, “Total Expenses”).

---

## Summary

- **Database**: PostgreSQL on Neon via `@neondatabase/serverless`, with `transactions` table keyed by Clerk `user.id`.
- **Auth**: Clerk (`@clerk/clerk-expo`) on the mobile side; backend trusts `userId`/`user_id` passed from the client (no server-side token verification yet).
- **Render**: Used to host the backend API (`API_URL` points at a Render URL in production).
- **Middleware**:
  - `cors`, `express.json()`, global Upstash-based rate limiter.
- **Controllers**:
  - `transactionsController` for CRUD and balances.
  - `analyticsController` for category breakdowns, trends, top categories, dashboard metrics.
- **Analytics**:
  - Computed entirely in SQL on the backend.
  - Visualized on mobile using `react-native-chart-kit` charts driven by `useAnalytics` hook.