# Architecture Choice & Solution Guide: Next.js Frontend with Express Backend

## 1. Why Your Current Code Fails

In your Next.js page (`frontend/src/app/dashboard/page.js`), you attempted to import Prisma directly from the `backend` folder:

```javascript
import prisma from "../../../../backend/prisma/prisma"; // ❌ Causes errors!
```

### Why this causes errors & architectural issues:

1. **Project Boundary & Bundling Mismatch**:
   - `frontend` and `backend` are two separate Node.js projects with their own `package.json` and `node_modules`.
   - Next.js's bundler (Webpack / Turbopack) cannot bundle native binary modules (like Prisma's Query Engine) across distinct project folders outside the Next.js root directory.

2. **Missing Environment Variables**:
   - The Prisma client in `backend/prisma/prisma.js` relies on `process.env.DATABASE_URL` loaded from `backend/.env`.
   - When imported inside `frontend`, Next.js only reads `frontend/.env`, causing database connection string errors (`DATABASE_URL is missing`).

3. **Duplicated Database Connection Pools**:
   - If both the Express server and the Next.js frontend instantiate Prisma instances, you double your active database connection pools. This can exhaust connection limits on database servers like PostgreSQL / MariaDB.

4. **Tightly Coupled Architecture**:
   - Importing backend internal database logic directly into frontend components breaks modularity and separation of concerns.

---

## 2. Comparing Your Two Main Architecture Options

| Criteria | **Option 1: Express REST API (Recommended for your current setup)** | **Option 2: Next.js Native Fullstack (Direct Prisma in Next.js)** |
| :--- | :--- | :--- |
| **Data Access** | Frontend calls Express API (`http://localhost:5000/api/...`), Express runs Prisma query | Next.js Server Components call Prisma directly inside `frontend` |
| **Separation of Concerns** | High (Backend handles business logic & DB; Frontend handles UI) | Low/Unified (Frontend & Backend merged into Next.js) |
| **Existing Express Backend** | Reuses your current Express routes, controllers, middleware, and Zod schemas | Requires deleting/migrating Express code into Next.js Route Handlers |
| **Performance** | Fast (Server Component `fetch` runs server-to-server locally) | Ultra-fast (Direct DB query in Next.js Server Component) |
| **Flexibility** | High (Allows future mobile apps or third-party clients to use the Express API) | Tied to Next.js framework |

---

## 3. The Recommended Solution: **Option 1 (Express REST API)**

Since you **already have a fully structured Express backend** (`backend/src/controllers`, `routes`, `middleware`, `schemas`), the cleanest and most scalable approach is to **keep database operations in Express** and **fetch data from Express inside Next.js Server Components**.

---

## 4. Step-by-Step Implementation

### Step 1: Add a Bad Habits Endpoint in Express (`backend`)

Add a GET controller method in `backend/src/controllers/dayGoals.controller.js` (or `goals.controller.js`):

```javascript
// GET /api/day-goals/bad-habits
const getBadHabits = async (req, res, next) => {
  try {
    const badHabits = await prisma.dayGoal.findMany({
      where: {
        goal: {
          category: {
            name: "Bad Habits"
          }
        }
      },
      include: {
        goal: true
      }
    });

    res.json({ success: true, data: badHabits });
  } catch (error) {
    next(error);
  }
};
```

Register this route in `backend/src/routes/dayGoals.js`:

```javascript
router.get('/bad-habits', controller.getBadHabits);
```

---

### Step 2: Fetch Data in Next.js Dashboard (`frontend`)

Update `frontend/src/app/dashboard/page.js`:

```javascript
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft, Flame } from "lucide-react";

async function getBadHabits() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const res = await fetch(`${API_URL}/day-goals/bad-habits`, {
    cache: "no-store", // or { next: { revalidate: 60 } } for caching
  });

  if (!res.ok) {
    throw new Error("Failed to fetch bad habits");
  }

  const json = await res.json();
  return json.data || [];
}

function Header() {
  return (
    <div className="flex justify-between items-end p-4">
      <Link href="/">
        <div className="flex gap-2">
          <ChevronLeft />
          <span>go home</span>
        </div>
      </Link>
    </div>
  );
}

export default async function Dashboard() {
  let badHabbits = [];
  try {
    badHabbits = await getBadHabits();
  } catch (error) {
    console.error("Error loading habits:", error);
  }

  return (
    <>
      <Header />
      <div className="flex justify-start items-center gap-12 p-8">
        {badHabbits.map((item) => (
          <Card className="flex justify-center items-center p-8 w-[200px] gap-2" key={item.id || item.name}>
            <div className="flex justify-between items-center gap-2">
              <Flame className="h-8 w-8 text-red-500 bg-orange-400 rounded-sm p-0" />
              <p>{item.goal?.title || item.name}</p>
              <p className="bg-[#3b3f5c] text-white rounded-full px-2 py-0 font-bold">
                {item.count || 0}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
```

---

## Summary Recommendation

1. **Do NOT import `prisma` cross-folder from `backend` into `frontend`.**
2. **Use HTTP APIs (`fetch`) from Next.js to your Express server.**
3. This keeps your Express application as the single source of truth for database operations, validation, and security rules, while Next.js handles server-side rendering and UI presentation.
