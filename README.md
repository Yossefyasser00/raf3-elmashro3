# فك زنقة (Fok Zan2a)

A request-first tutoring marketplace: a student describes a specific problem
("مش فاهم الفصل التالت في الكيمياء"), the platform surfaces the best 3–5
matching tutors, the student books, pays, learns, takes a short quiz, and
rates the tutor. Built to start at Mansoura University and scale to others.

## 1. Architecture

```
┌────────────┐      REST (JWT)      ┌──────────────┐      Prisma       ┌────────────┐
│  Next.js    │ ───────────────────▶ │   NestJS      │ ─────────────────▶ │ PostgreSQL │
│  frontend   │ ◀─────────────────── │   backend     │ ◀───────────────── │            │
└────────────┘      WebSocket        └──────┬───────┘                    └────────────┘
                     (chat, notifs)         │
                                      ┌──────┴───────┐
                                      │    Redis      │  cache / sessions / rate-limit
                                      └───────────────┘
                                      ┌───────────────┐
                                      │ S3-compatible  │  avatars, attachments, videos
                                      │ object storage │
                                      └───────────────┘
```

Backend is modular NestJS: each domain (auth, requests, tutors, bookings,
payments, reviews, points, workshops, quizzes, notifications, chat, admin)
is its own module with its own controller/service, all sharing one
`PrismaService`. This repo implements `auth` and `requests` fully as the
reference pattern; the rest follow the same shape (see "Next steps" below).

Three architectural decisions carry the whole product:

- **Roles are a join table, not an enum column on `User`.** A user can be a
  Student and a Tutor at once, so `UserRole` allows multiple roles per user
  without a schema change later.
- **The request lifecycle is a backend state machine**
  (`request-status.state-machine.ts`), not something the frontend infers.
  Every transition is validated against an allow-list and written to
  `RequestStatusHistory`, which is what makes `DISPUTED` resolvable later.
- **Payments are provider-agnostic.** `PaymentProvider` is an interface;
  `ManualPaymentProvider` is the MVP implementation so the full
  book → pay → confirm flow works before an Egyptian PSP (Paymob, Fawry,
  Kashier) is integrated — that's a new class, not a rewrite.

## 2. Folder structure

```
fokzanqa/
├── backend/
│   ├── prisma/schema.prisma        # full data model
│   └── src/
│       ├── auth/                   # register/login/refresh, JWT strategy, RBAC guard
│       ├── requests/                # request state machine + matching orchestration
│       ├── tutors/                  # tutor ranking/matching engine
│       ├── payments/                # PaymentProvider abstraction + manual provider
│       ├── admin/                   # SettingsService (configurable commission, etc.)
│       ├── common/                  # decorators (@Roles, @Public), guards
│       └── app.module.ts
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # landing page (matches provided design)
│   │   └── requests/new/page.tsx    # "what's your problem?" request form
│   └── components/                  # Navbar, Hero, FeatureStrip, HowItWorks
└── docker-compose.yml               # postgres + redis + backend + frontend
```

## 3. Database schema

See `backend/prisma/schema.prisma` — the full normalized schema for every
entity listed in the brief (User, StudentProfile, TutorProfile,
TutorApplication, University/Faculty/Department/Subject/Topic, Request +
RequestStatusHistory + RequestMatch, Booking, Availability, Payment, Review,
Notification, Conversation/Message, Workshop/WorkshopEnrollment,
Quiz/QuizAttempt, PointTransaction/PointRule/Reward, PlatformSetting), with
foreign keys, unique constraints (e.g. `Booking` is unique on
`(tutorId, startsAt)` to prevent double-booking at the DB level), and
indexes on the columns the matching engine and admin dashboard filter by.

## 4. API endpoints (MVP surface)

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

POST   /api/v1/requests                    (student) create a draft request
PATCH  /api/v1/requests/:id/publish        (student) publish → triggers matching
PATCH  /api/v1/requests/:id/select-tutor   (student) pick from the shortlist
PATCH  /api/v1/requests/:id/cancel         (student|admin)

GET    /api/v1/tutors/:id                  public tutor profile
POST   /api/v1/tutors/apply                (student) submit TutorApplication
PATCH  /api/v1/admin/tutor-applications/:id (admin) accept/reject/request changes

POST   /api/v1/bookings                    (student) confirm booking + time slot
POST   /api/v1/payments/charge             create a charge via active PaymentProvider
POST   /api/v1/payments/webhook/:provider  provider callback → payment status update

POST   /api/v1/reviews                     (student) rate a completed booking
GET    /api/v1/points/balance              (student)
GET    /api/v1/admin/settings              (admin) commission %, reward rules, etc.
PATCH  /api/v1/admin/settings/:key         (admin) update a setting
```

Every mutating route sits behind `JwtAuthGuard` (global by default,
`@Public()` opts out) and `RolesGuard` (`@Roles('STUDENT')`, etc.), and
services additionally check resource ownership (`getOwnedRequest`) so one
student can never act on another student's request — IDOR protection at
the service layer, not just the route.

## 5. Main user flows

**Student:** Home → "إيه اللي مزنقك؟" → create request (subject, topic,
mode, budget, time) → publish → see top 3–5 matched tutors → pick one →
book & pay → attend session → optional quiz → rate tutor → earn points.

**Tutor:** Apply (video intro + sample explanation) → wait for admin
verification → set availability → receive matched requests → accept →
teach → get paid (minus commission) → reputation updates from real
completed sessions.

**Admin:** Review tutor applications → verify tutors → configure commission
% and reward rules → moderate disputes → monitor revenue/requests/reviews.

## 6. MVP scope vs. V2

**In this MVP:** auth + roles, student/tutor profiles, tutor applications,
request creation + matching engine, tutor selection, booking with
double-booking prevention, payment abstraction (manual provider), reviews,
points ledger, admin settings for commission. Chat and notifications are
schema-ready (`Conversation`/`Message`, `Notification`) with a WebSocket
gateway to be added next.

**Postponed to V2:** real Egyptian PSP integration (Paymob/Fawry), AI
quiz generation and tutor recommendations (the `Quiz`/`isAiGenerated` field
and an `AiService` interface are the intended seam), WhatsApp/SMS
notification channels, in-person location approval workflow beyond a free
text field, multi-university admin tooling beyond Mansoura.

## 7. Running locally

```bash
git clone <repo> && cd fokzanqa

# 1. Infra
docker compose up -d postgres redis

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run start:dev        # http://localhost:4000/api/v1

# 3. Frontend
cd ../frontend
npm install
npm run dev               # http://localhost:3000
```

## 8. Next steps to reach full MVP

1. `TutorsModule` (profile CRUD, application review), `BookingsModule`
   (slot confirmation + Prisma transaction for the double-booking check),
   `PaymentsModule` (wraps `ManualPaymentProvider` behind `PaymentService`).
2. `ReviewsModule` + `PointsModule` (award points via `PointRule` lookups,
   never hard-coded amounts).
3. `NotificationsModule` + a Socket.IO gateway for `ChatModule` —
   the `Conversation`/`Message` tables are ready.
4. `AdminModule` REST surface over `SettingsService` for the dashboard
   pages listed in the brief.
5. Wire the frontend `requests/new` form to `POST /requests` +
   `PATCH /:id/publish`, then build the "top 3–5 matches" results screen.
