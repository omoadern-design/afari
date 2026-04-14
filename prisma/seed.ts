import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL ?? "file:./dev.db";

const adapter = new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean up existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.approvalAction.deleteMany();
  await prisma.approvalRequest.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ─── Policy ──────────────────────────────────────────────────────────────────
  const policy = await prisma.policy.create({
    data: {
      name: "Standard Corporate Travel Policy",
      description: "Default policy for all employees. Updated Q1 2025.",
      isActive: true,
      priority: 10,
      flightMaxPrice: 1200,
      flightCabinEconomy: true,
      flightCabinBusiness: false,
      flightAdvanceDays: 7,
      flightMaxDuration: 14,
      hotelMaxNightlyRate: 250,
      carMaxDailyRate: 80,
      carAllowedClasses: JSON.stringify(["ECONOMY", "COMPACT", "MIDSIZE"]),
      mealDailyLimit: 75,
      entertainmentLimit: 150,
      requireReceiptAbove: 25,
      approvalThreshold: 500,
      autoApproveBelow: 50,
    },
  });

  console.log("✅ Policy created");

  // ─── Users ───────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: "admin@acme.com",
      name: "Alex Thompson",
      passwordHash: hash("admin123"),
      role: "ADMIN",
      department: "IT",
      title: "Platform Administrator",
      employeeId: "EMP-001",
      isActive: true,
    },
  });

  const finance = await prisma.user.create({
    data: {
      email: "finance@acme.com",
      name: "Jordan Liu",
      passwordHash: hash("finance123"),
      role: "FINANCE",
      department: "Finance",
      title: "VP Finance",
      employeeId: "EMP-002",
      isActive: true,
    },
  });

  const sarahManager = await prisma.user.create({
    data: {
      email: "sarah.manager@acme.com",
      name: "Sarah Chen",
      passwordHash: hash("password123"),
      role: "MANAGER",
      department: "Engineering",
      title: "Engineering Manager",
      employeeId: "EMP-003",
      isActive: true,
    },
  });

  const mikeManager = await prisma.user.create({
    data: {
      email: "mike.manager@acme.com",
      name: "Mike Rodriguez",
      passwordHash: hash("password123"),
      role: "MANAGER",
      department: "Sales",
      title: "Sales Manager",
      employeeId: "EMP-004",
      isActive: true,
    },
  });

  const linaManager = await prisma.user.create({
    data: {
      email: "lina.manager@acme.com",
      name: "Lina Patel",
      passwordHash: hash("password123"),
      role: "MANAGER",
      department: "Marketing",
      title: "Marketing Manager",
      employeeId: "EMP-005",
      isActive: true,
    },
  });

  // Engineering employees
  const alice = await prisma.user.create({
    data: {
      email: "alice@acme.com",
      name: "Alice Johnson",
      passwordHash: hash("password123"),
      role: "EMPLOYEE",
      department: "Engineering",
      title: "Senior Software Engineer",
      employeeId: "EMP-006",
      managerId: sarahManager.id,
      isActive: true,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@acme.com",
      name: "Bob Kim",
      passwordHash: hash("password123"),
      role: "EMPLOYEE",
      department: "Engineering",
      title: "Software Engineer",
      employeeId: "EMP-007",
      managerId: sarahManager.id,
      isActive: true,
    },
  });

  // Sales employees
  const carol = await prisma.user.create({
    data: {
      email: "carol@acme.com",
      name: "Carol Martinez",
      passwordHash: hash("password123"),
      role: "EMPLOYEE",
      department: "Sales",
      title: "Account Executive",
      employeeId: "EMP-008",
      managerId: mikeManager.id,
      isActive: true,
    },
  });

  const dave = await prisma.user.create({
    data: {
      email: "dave@acme.com",
      name: "Dave Wilson",
      passwordHash: hash("password123"),
      role: "EMPLOYEE",
      department: "Sales",
      title: "Sales Representative",
      employeeId: "EMP-009",
      managerId: mikeManager.id,
      isActive: true,
    },
  });

  // Marketing employees
  const emma = await prisma.user.create({
    data: {
      email: "emma@acme.com",
      name: "Emma Davis",
      passwordHash: hash("password123"),
      role: "EMPLOYEE",
      department: "Marketing",
      title: "Marketing Specialist",
      employeeId: "EMP-010",
      managerId: linaManager.id,
      isActive: true,
    },
  });

  const frank = await prisma.user.create({
    data: {
      email: "frank@acme.com",
      name: "Frank Brown",
      passwordHash: hash("password123"),
      role: "EMPLOYEE",
      department: "Marketing",
      title: "Content Manager",
      employeeId: "EMP-011",
      managerId: linaManager.id,
      isActive: true,
    },
  });

  console.log("✅ Users created");

  // ─── Budgets ─────────────────────────────────────────────────────────────────
  const budgets = [
    { name: "Engineering Q1 2025", department: "Engineering", period: "2025-Q1", totalAmount: 85000 },
    { name: "Sales Q1 2025", department: "Sales", period: "2025-Q1", totalAmount: 120000 },
    { name: "Marketing Q1 2025", department: "Marketing", period: "2025-Q1", totalAmount: 45000 },
    { name: "Engineering Q2 2025", department: "Engineering", period: "2025-Q2", totalAmount: 90000 },
    { name: "Sales Q2 2025", department: "Sales", period: "2025-Q2", totalAmount: 130000 },
    { name: "Marketing Q2 2025", department: "Marketing", period: "2025-Q2", totalAmount: 50000 },
  ];

  for (const b of budgets) {
    await prisma.budget.create({
      data: {
        ...b,
        periodType: "QUARTERLY",
        currency: "USD",
        alertAt: 0.8,
      },
    });
  }

  console.log("✅ Budgets created");

  // ─── Helper: dates going back N months ────────────────────────────────────────
  function daysAgo(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────────
  const bookingData = [
    // Alice - Engineering conferences (in-policy)
    {
      userId: alice.id,
      type: "FLIGHT",
      status: "COMPLETED",
      policyResult: "IN_POLICY",
      totalAmount: 420,
      purpose: "AWS re:Invent conference",
      flightData: JSON.stringify({
        origin: "SFO", destination: "LAS", departureDate: daysAgo(90).toISOString().split("T")[0],
        returnDate: daysAgo(86).toISOString().split("T")[0], airline: "Southwest",
        flightNumber: "WN2341", cabinClass: "ECONOMY", duration: 75, stops: 0, passengers: 1,
        isRoundTrip: true, departureTime: "08:30", arrivalTime: "09:45"
      }),
      createdAt: daysAgo(95),
    },
    {
      userId: alice.id,
      type: "HOTEL",
      status: "COMPLETED",
      policyResult: "IN_POLICY",
      totalAmount: 800,
      purpose: "AWS re:Invent conference",
      hotelData: JSON.stringify({
        hotelName: "MGM Grand", address: "3799 S Las Vegas Blvd", city: "Las Vegas",
        country: "USA", checkIn: daysAgo(90).toISOString().split("T")[0],
        checkOut: daysAgo(86).toISOString().split("T")[0], nights: 4,
        roomType: "Standard Room", nightlyRate: 200, rating: 4, amenities: ["WiFi", "Gym", "Pool"]
      }),
      createdAt: daysAgo(95),
    },
    // Bob - Customer visit (in-policy)
    {
      userId: bob.id,
      type: "FLIGHT",
      status: "COMPLETED",
      policyResult: "IN_POLICY",
      totalAmount: 380,
      purpose: "Customer meeting - Acme Corp",
      flightData: JSON.stringify({
        origin: "SFO", destination: "SEA", departureDate: daysAgo(60).toISOString().split("T")[0],
        airline: "Alaska", flightNumber: "AS1234", cabinClass: "ECONOMY", duration: 120,
        stops: 0, passengers: 1, isRoundTrip: false, departureTime: "07:00", arrivalTime: "09:00"
      }),
      createdAt: daysAgo(65),
    },
    // Carol - Sales trip (requires approval - out of policy)
    {
      userId: carol.id,
      type: "FLIGHT",
      status: "CONFIRMED",
      policyResult: "REQUIRES_APPROVAL",
      policyViolations: JSON.stringify(["Flight price $1,450 exceeds policy limit of $1,200 (21% over)"]),
      totalAmount: 1450,
      purpose: "Enterprise client onboarding - New York",
      justification: "Key enterprise client onboarding that could generate $500K revenue. Early booking was missed due to last-minute scheduling.",
      flightData: JSON.stringify({
        origin: "LAX", destination: "JFK", departureDate: daysAgo(15).toISOString().split("T")[0],
        returnDate: daysAgo(12).toISOString().split("T")[0], airline: "United",
        flightNumber: "UA1100", cabinClass: "ECONOMY", duration: 320, stops: 0, passengers: 1,
        isRoundTrip: true, departureTime: "09:00", arrivalTime: "17:20"
      }),
      createdAt: daysAgo(18),
    },
    // Dave - Hotel out of policy
    {
      userId: dave.id,
      type: "HOTEL",
      status: "PENDING_APPROVAL",
      policyResult: "REQUIRES_APPROVAL",
      policyViolations: JSON.stringify(["Hotel rate $320/night exceeds policy limit of $250/night (28% over)"]),
      totalAmount: 1600,
      purpose: "Sales summit Q2",
      justification: "All hotels within policy were fully booked for the conference dates. This is the closest available option.",
      hotelData: JSON.stringify({
        hotelName: "Marriott Marquis Times Square", address: "1535 Broadway", city: "New York",
        country: "USA", checkIn: daysAgo(5).toISOString().split("T")[0],
        checkOut: daysAgo(0).toISOString().split("T")[0], nights: 5,
        roomType: "Deluxe Room", nightlyRate: 320, rating: 4, amenities: ["WiFi", "Gym", "Bar", "Restaurant"]
      }),
      createdAt: daysAgo(7),
    },
    // Emma - Marketing events
    {
      userId: emma.id,
      type: "FLIGHT",
      status: "COMPLETED",
      policyResult: "IN_POLICY",
      totalAmount: 550,
      purpose: "Marketing summit",
      flightData: JSON.stringify({
        origin: "NYC", destination: "CHI", departureDate: daysAgo(45).toISOString().split("T")[0],
        airline: "American", flightNumber: "AA2210", cabinClass: "ECONOMY", duration: 155, stops: 0,
        passengers: 1, isRoundTrip: false, departureTime: "10:30", arrivalTime: "12:05"
      }),
      createdAt: daysAgo(50),
    },
    {
      userId: emma.id,
      type: "CAR",
      status: "COMPLETED",
      policyResult: "IN_POLICY",
      totalAmount: 240,
      purpose: "Marketing summit - ground transport",
      carData: JSON.stringify({
        rentalCompany: "Enterprise", pickupLocation: "O'Hare Airport", dropoffLocation: "O'Hare Airport",
        pickupDate: daysAgo(45).toISOString().split("T")[0], dropoffDate: daysAgo(42).toISOString().split("T")[0],
        days: 3, carClass: "COMPACT", dailyRate: 55, model: "Ford Focus"
      }),
      createdAt: daysAgo(50),
    },
    // Mike - Manager trip
    {
      userId: mikeManager.id,
      type: "FLIGHT",
      status: "COMPLETED",
      policyResult: "IN_POLICY",
      totalAmount: 890,
      purpose: "Annual sales kickoff",
      flightData: JSON.stringify({
        origin: "DFW", destination: "MIA", departureDate: daysAgo(30).toISOString().split("T")[0],
        returnDate: daysAgo(27).toISOString().split("T")[0], airline: "American",
        flightNumber: "AA890", cabinClass: "ECONOMY", duration: 165, stops: 0, passengers: 1,
        isRoundTrip: true, departureTime: "07:45", arrivalTime: "11:30"
      }),
      createdAt: daysAgo(35),
    },
    // Frank - Recent booking
    {
      userId: frank.id,
      type: "FLIGHT",
      status: "CONFIRMED",
      policyResult: "IN_POLICY",
      totalAmount: 640,
      purpose: "Content creator summit",
      flightData: JSON.stringify({
        origin: "BOS", destination: "LAX", departureDate: daysAgo(3).toISOString().split("T")[0],
        returnDate: daysAgo(0).toISOString().split("T")[0], airline: "JetBlue",
        flightNumber: "B6500", cabinClass: "ECONOMY", duration: 360, stops: 1, passengers: 1,
        isRoundTrip: true, departureTime: "09:00", arrivalTime: "15:00"
      }),
      createdAt: daysAgo(10),
    },
  ];

  const createdBookings: any[] = [];
  for (const b of bookingData) {
    const booking = await prisma.booking.create({ data: b as any });
    createdBookings.push(booking);
  }

  console.log("✅ Bookings created");

  // Create approval requests for pending/out-of-policy bookings
  const carolBooking = createdBookings.find((b) => b.userId === carol.id && b.type === "FLIGHT");
  const daveBooking = createdBookings.find((b) => b.userId === dave.id && b.type === "HOTEL");

  if (carolBooking) {
    await prisma.approvalRequest.create({
      data: {
        requesterId: carol.id,
        subjectType: "BOOKING",
        status: "APPROVED",
        currentApproverId: mikeManager.id,
        bookingId: carolBooking.id,
        respondedAt: daysAgo(14),
        dueAt: daysAgo(16),
        actions: {
          create: {
            actorId: mikeManager.id,
            action: "APPROVE",
            comment: "Approved - valid business justification for this key account.",
          },
        },
      },
    });
  }

  if (daveBooking) {
    await prisma.approvalRequest.create({
      data: {
        requesterId: dave.id,
        subjectType: "BOOKING",
        status: "PENDING",
        currentApproverId: mikeManager.id,
        bookingId: daveBooking.id,
        dueAt: daysAgo(-2), // due in 2 days
      },
    });
  }

  console.log("✅ Approval requests created");

  // ─── Expenses ─────────────────────────────────────────────────────────────────
  const categories = [
    "AIRFARE", "LODGING", "GROUND_TRANSPORT", "MEALS", "ENTERTAINMENT",
    "COMMUNICATION", "OFFICE_SUPPLIES", "CONFERENCE", "OTHER"
  ];

  const expenseTemplates = [
    // Alice expenses
    { userId: alice.id, category: "MEALS", amount: 45, description: "Team lunch", merchantName: "The Kitchen", merchantCity: "San Francisco", status: "PAID", daysBack: 3 },
    { userId: alice.id, category: "CONFERENCE", amount: 1200, description: "AWS re:Invent registration", merchantName: "Amazon Web Services", merchantCity: "Las Vegas", status: "APPROVED", daysBack: 92 },
    { userId: alice.id, category: "MEALS", amount: 68, description: "Client dinner", merchantName: "Waterbar", merchantCity: "San Francisco", status: "PENDING_APPROVAL", daysBack: 1 },
    { userId: alice.id, category: "OFFICE_SUPPLIES", amount: 89, description: "Monitor stand and keyboard", merchantName: "Amazon", merchantCity: "Online", status: "APPROVED", daysBack: 20 },
    { userId: alice.id, category: "COMMUNICATION", amount: 50, description: "Cell phone bill (work portion)", merchantName: "Verizon", merchantCity: "Online", status: "PAID", daysBack: 15 },
    { userId: alice.id, category: "GROUND_TRANSPORT", amount: 28, description: "Uber to airport", merchantName: "Uber", merchantCity: "San Francisco", status: "PAID", daysBack: 91 },
    // Bob expenses
    { userId: bob.id, category: "MEALS", amount: 35, description: "Working lunch", merchantName: "Chipotle", merchantCity: "Seattle", status: "PAID", daysBack: 58 },
    { userId: bob.id, category: "GROUND_TRANSPORT", amount: 45, description: "Taxi to customer office", merchantName: "Yellow Cab", merchantCity: "Seattle", status: "PAID", daysBack: 60 },
    { userId: bob.id, category: "MEALS", amount: 82, description: "Client dinner - over limit", merchantName: "Canlis", merchantCity: "Seattle", status: "PENDING_APPROVAL", policyResult: "REQUIRES_APPROVAL", policyViolations: JSON.stringify(["Meal expense $82 exceeds daily limit of $75"]), daysBack: 59 },
    // Carol expenses
    { userId: carol.id, category: "ENTERTAINMENT", amount: 145, description: "Client entertainment - baseball game", merchantName: "Yankee Stadium", merchantCity: "New York", status: "APPROVED", daysBack: 14 },
    { userId: carol.id, category: "MEALS", amount: 65, description: "Business dinner with prospect", merchantName: "Daniel NYC", merchantCity: "New York", status: "PAID", daysBack: 13 },
    { userId: carol.id, category: "GROUND_TRANSPORT", amount: 55, description: "Car service to client office", merchantName: "Lyft", merchantCity: "New York", status: "PAID", daysBack: 15 },
    { userId: carol.id, category: "ENTERTAINMENT", amount: 180, description: "Team celebration dinner - over limit", merchantName: "Per Se", merchantCity: "New York", status: "FLAGGED", policyResult: "REQUIRES_APPROVAL", aiAnomalyScore: 0.45, aiAnomalyReason: "Entertainment expense $180 exceeds policy limit of $150. Amount is above average for this category.", policyViolations: JSON.stringify(["Entertainment expense $180 exceeds policy limit of $150"]), daysBack: 12 },
    // Dave expenses
    { userId: dave.id, category: "MEALS", amount: 42, description: "Team lunch", merchantName: "Shake Shack", merchantCity: "Dallas", status: "PAID", daysBack: 10 },
    { userId: dave.id, category: "COMMUNICATION", amount: 60, description: "International calls - client", merchantName: "AT&T", merchantCity: "Online", status: "APPROVED", daysBack: 25 },
    // Emma expenses
    { userId: emma.id, category: "CONFERENCE", amount: 800, description: "Marketing summit registration", merchantName: "Content Marketing World", merchantCity: "Chicago", status: "APPROVED", daysBack: 52 },
    { userId: emma.id, category: "MEALS", amount: 55, description: "Speaker dinner", merchantName: "RPM Italian", merchantCity: "Chicago", status: "PAID", daysBack: 44 },
    { userId: emma.id, category: "GROUND_TRANSPORT", amount: 38, description: "Airport taxi", merchantName: "Chicago Taxi", merchantCity: "Chicago", status: "PAID", daysBack: 45 },
    { userId: emma.id, category: "OFFICE_SUPPLIES", amount: 200, description: "Trade show materials", merchantName: "FedEx Office", merchantCity: "Chicago", status: "APPROVED", daysBack: 48 },
    // Frank expenses
    { userId: frank.id, category: "MEALS", amount: 30, description: "Working lunch", merchantName: "Sweetgreen", merchantCity: "Boston", status: "PAID", daysBack: 5 },
    { userId: frank.id, category: "ENTERTAINMENT", amount: 95, description: "Podcast recording session", merchantName: "Studio B", merchantCity: "Boston", status: "APPROVED", daysBack: 20 },
    // Mike expenses
    { userId: mikeManager.id, category: "ENTERTAINMENT", amount: 300, description: "Client entertainment - golf outing", merchantName: "Pebble Beach Golf", merchantCity: "Monterey", status: "FLAGGED", policyResult: "REQUIRES_APPROVAL", aiAnomalyScore: 0.72, aiAnomalyReason: "Entertainment expense $300 significantly exceeds policy limit of $150. Amount is 2.0x above average.", policyViolations: JSON.stringify(["Entertainment expense $300 exceeds policy limit of $150"]), daysBack: 8 },
    { userId: mikeManager.id, category: "MEALS", amount: 72, description: "Team dinner", merchantName: "Fleming's Steakhouse", merchantCity: "Dallas", status: "APPROVED", daysBack: 28 },
    // Sarah expenses
    { userId: sarahManager.id, category: "CONFERENCE", amount: 2500, description: "KubeCon registration + workshop", merchantName: "CNCF", merchantCity: "Salt Lake City", status: "APPROVED", daysBack: 40 },
    { userId: sarahManager.id, category: "MEALS", amount: 70, description: "Engineering team dinner", merchantName: "Farmhouse Kitchen", merchantCity: "San Francisco", status: "PAID", daysBack: 7 },
    { userId: sarahManager.id, category: "OFFICE_SUPPLIES", amount: 450, description: "Standing desk converter", merchantName: "Amazon Business", merchantCity: "Online", status: "PENDING_APPROVAL", daysBack: 2 },
    // Lina expenses
    { userId: linaManager.id, category: "ENTERTAINMENT", amount: 120, description: "Partner appreciation event", merchantName: "Eventbrite", merchantCity: "San Francisco", status: "APPROVED", daysBack: 18 },
    { userId: linaManager.id, category: "COMMUNICATION", amount: 75, description: "Design software subscription", merchantName: "Adobe", merchantCity: "Online", status: "PAID", daysBack: 30 },
  ];

  for (const e of expenseTemplates) {
    const d = daysAgo(e.daysBack);
    await prisma.expense.create({
      data: {
        userId: e.userId,
        category: e.category,
        status: e.status,
        amount: e.amount,
        currency: "USD",
        description: e.description,
        merchantName: e.merchantName,
        merchantCity: e.merchantCity,
        transactionDate: d,
        policyResult: (e as any).policyResult ?? "IN_POLICY",
        policyViolations: (e as any).policyViolations ?? null,
        aiAnomalyScore: (e as any).aiAnomalyScore ?? null,
        aiAnomalyReason: (e as any).aiAnomalyReason ?? null,
        policyId: policy.id,
      },
    });
  }

  console.log("✅ Expenses created");

  // Create some notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: mikeManager.id,
        type: "APPROVAL_NEEDED",
        title: "Approval Required",
        body: "Dave Wilson's hotel booking requires your approval ($1,600 - out of policy by 28%)",
        isRead: false,
        linkUrl: "/approvals",
      },
      {
        userId: carol.id,
        type: "APPROVED",
        title: "Booking Approved",
        body: "Your flight to New York was approved by Mike Rodriguez",
        isRead: true,
        linkUrl: "/travel",
      },
      {
        userId: finance.id,
        type: "ANOMALY",
        title: "Expense Flagged",
        body: "Mike Rodriguez's entertainment expense ($300) has been flagged for review",
        isRead: false,
        linkUrl: "/finance",
      },
      {
        userId: finance.id,
        type: "ANOMALY",
        title: "Expense Flagged",
        body: "Carol Martinez's entertainment expense ($180) was flagged - exceeds policy limit",
        isRead: false,
        linkUrl: "/finance",
      },
      {
        userId: alice.id,
        type: "APPROVED",
        title: "Expense Approved",
        body: "Your office supplies expense ($89) has been approved",
        isRead: false,
        linkUrl: "/expenses",
      },
    ],
  });

  console.log("✅ Notifications created");
  console.log("\n🎉 Database seeded successfully!\n");
  console.log("Demo accounts:");
  console.log("  Admin:    admin@acme.com    / admin123");
  console.log("  Finance:  finance@acme.com  / finance123");
  console.log("  Manager:  sarah.manager@acme.com / password123");
  console.log("  Employee: alice@acme.com    / password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
