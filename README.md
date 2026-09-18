# HORYZON

**Academic & Career Decision Intelligence Platform**

> *Turn complex data into actionable classifications and decisions.*  
> *Where are you now, and what's your next horizon?*

Horyzon is a Decision Intelligence platform built with Next.js that helps students, university learners, and career counselors understand their current academic and competency position, identify gaps against a target career or education path, and define concrete next steps.

This platform is **not** a future predictor. Classifications are *decision support* based on the user's actual data — not a guarantee that someone will be admitted to a specific university or land a particular job.

---

## Table of Contents

1. [Product Philosophy](#1-product-philosophy)
2. [Problem Being Solved](#2-problem-being-solved)
3. [Core Flow](#3-core-flow)
4. [Two Core Modules](#4-two-core-modules)
5. [Role System](#5-role-system)
6. [Detailed Workflows by Role](#6-detailed-workflows-by-role)
7. [Classification Engine (Career Readiness)](#7-classification-engine-career-readiness)
8. [Academic Path Classification](#8-academic-path-classification)
9. [Competency Level Rubric](#9-competency-level-rubric)
10. [Profile Completeness & Confidence](#10-profile-completeness--confidence)
11. [Career Library & Comparison](#11-career-library--comparison)
12. [Action Plan & Progress Tracking](#12-action-plan--progress-tracking)
13. [Sharing, Counselor & Feedback](#13-sharing-counselor--feedback)
14. [Admin Panel & Configuration](#14-admin-panel--configuration)
15. [AI Integration](#15-ai-integration)
16. [Technical Architecture](#16-technical-architecture)
17. [Folder Structure](#17-folder-structure)
18. [Database Schema (Conceptual)](#18-database-schema-conceptual)
19. [Tech Stack](#19-tech-stack)
20. [Setup & Running the Project](#20-setup--running-the-project)
21. [Environment Variables](#21-environment-variables)
22. [UX & Design Principles](#22-ux--design-principles)
23. [Demo Scenario](#23-demo-scenario)
24. [Success Criteria](#24-success-criteria)
25. [Limitations & Disclaimer](#25-limitations--disclaimer)

---

## 1. Product Philosophy

Horyzon is built on two core principles:

1. **Classification is not prediction**  
   The system never claims: *"You will become a successful developer."*  
   The system says: *"Based on the competency requirements and the information you provided, your current profile is classified as Ready With Gaps."*

2. **Final decisions stay with the user**  
   Horyzon does not say: *"This is the career you should choose."*  
   Horyzon says: *"Here is what your current data suggests, here is how your profile compares with the requirements, here are the gaps, and here are the paths you can explore."*

Every classification result, readiness score, gap analysis, and recommendation **must be explainable** from the user's actual data — never random or hardcoded numbers.

---

## 2. Problem Being Solved

Choosing an education path and career is a complex decision. A student typically has:

- Academic grades
- Technical and non-technical skills
- Personal projects
- Organizational / competition experience
- Certificates
- Interests and career goals

Yet all of this data is usually **scattered** and hard to use for answering objective questions:

> *"I am interested in this field"* ≠ *"I have the competencies required to pursue this field."*

Horyzon bridges that gap by turning fragmented data into **actionable structured intelligence**.

---

## 3. Core Flow

```
User Data
   ↓
Profile Analysis
   ↓
Classification (Academic + Career)
   ↓
Explanation (grounded in actual data)
   ↓
Gap Analysis
   ↓
Recommendation & Action Plan
   ↓
Progress / Reassessment
```

**Classification is the core of the product.** Every other feature exists to support or explain the classification result.

---

## 4. Two Core Modules

### 4.1 Academic Path Classification

Analyzes the user's academic profile, skills, experience, and interests to produce:

- **Academic Profile Type**: Technical-Oriented, Creative-Oriented, Analytical-Oriented, Communication-Oriented, or Multidisciplinary
- **Education Path Recommendations** with compatibility scores and explanations of contributing factors

### 4.2 Career Readiness Classification

The user selects a target career → the system compares the user profile against that career's competency requirements → produces:

- Readiness Score (0–100)
- Classification Level (EXPLORING → CAREER READY)
- Competency Gap Analysis
- Explanation
- Prioritized Action Plan

Both modules use the **same profile data**.

---

## 5. Role System

| Role | Primary Access |
|------|----------------|
| **Student / User** | Create & manage profile, run assessments, view gaps & action plans, track progress, share with mentors, ask AI / counselor |
| **Counselor / Mentor** | View shared profiles & assessments, answer student questions, provide feedback, help build development plans |
| **Admin** | Manage careers, competencies, classification rules/thresholds, users, assessment records, audit log, platform analytics |

Roles are stored in `profiles.role` and enforced in layouts / server actions (guards).

---

## 6. Detailed Workflows by Role

### 6.1 Student Workflow

1. **Register / Login** → Supabase Auth
2. **Complete Profile** (`/dashboard/profile`)
   - Academic data (Mathematics, English, Science, Indonesian, Social Studies, Vocational)
   - Skills + level (1–5) + evidence
   - Projects, competitions, organizations, internships, certificates
   - Interests
3. **Run Academic Assessment** (`/dashboard/academic`)
   - Receive Academic Profile + education path recommendations
4. **Browse Career Library** (`/dashboard/careers`)
   - Read descriptions, competency requirements, recommended learning areas
   - Compare multiple careers (`/dashboard/careers/compare`)
5. **Select Target Career & Run Assessment** (`/dashboard/assessment`)
   - Readiness Score + Classification
   - Gap Table (Exceeds / Meets / Gap / Major Gap)
   - Explanation + Action Plan
6. **Update a competency** → **Reassessment** → view progress at `/dashboard/progress`
7. **Share assessment** with a counselor via share link
8. **Ask AI** or **Ask Counselor** to interpret results

### 6.2 Counselor Workflow

1. Log in with role `counselor` / `mentor`
2. Counselor dashboard → list of students / shared assessments
3. Open an assessment via share token or student list
4. Review profile, gaps, and classification
5. Answer student questions (`/counselor/questions`)
6. Provide feedback / development plan suggestions

### 6.3 Admin Workflow

1. Log in with role `admin`
2. Manage **Careers** (CRUD + competency requirements + weight + is_core)
3. Manage **Competencies** & level rubrics
4. Update **Classification Rules / Thresholds** (without changing source code)
5. View **Users**, **Assessments**, **Analytics**, **Audit Log**

---

## 7. Classification Engine (Career Readiness)

Core location: `src/lib/classification/engine.ts`

### 7.1 Inputs

- **UserProfile**: academic scores, skills (competencyId + level 1–5 + evidence), experiences, interests
- **CareerProfile**: list of competency requirements (competencyId, requiredLevel, weight, is_core)
- **Thresholds** (optional, from DB): CAREER_READY, READY_WITH_GAPS, DEVELOPING

### 7.2 Readiness Score

```
score = Σ ( min(currentLevel / requiredLevel, 1.2) × weight ) / totalWeight × 100
```

- Ratio per competency is capped at **1.2** (exceeding required level yields a small bonus)
- Final score is capped at **100**
- Competencies the user has not filled are treated as level **1** (default)

### 7.3 Classification Levels

| Level | Default Threshold | Meaning |
|-------|-------------------|---------|
| **CAREER_READY** | ≥ 85 | Meets most competency requirements |
| **READY_WITH_GAPS** | 70 – 84 | Most core competencies are met; a few areas still need development |
| **DEVELOPING** | 50 – 69 | Some relevant competencies exist; significant gaps remain |
| **EXPLORING** | < 50 | Early exploration stage; limited evidence against the target career |

Thresholds can be changed by an Admin via the `classification_rules` table without modifying code.

### 7.4 Gap Status

| Status | Condition |
|--------|-----------|
| **EXCEEDS** | current ≥ required + 1 |
| **MEETS** | current === required |
| **GAP** | current === required − 1 |
| **MAJOR_GAP** | current ≤ required − 2 |

### 7.5 Explanation & Action Plan

The engine produces:

- **strongestAreas** — top 3 competencies with status EXCEEDS/MEETS (sorted by weight)
- **mainGaps** — competencies with status GAP/MAJOR_GAP
- **summary** — explanatory text based on classification level + score
- **actionPlan** — up to 5 prioritized items (sorted by weight & gap size), each with currentLevel → targetLevel + suggestedAction

All explanations are **derived from actual data**, not generic templates without context.

### 7.6 Invocation

Server Action `runAssessment(careerId)` in `src/lib/actions/assesments.ts`:

1. Auth check
2. Load career + requirements + user competencies + academic + experiences + interests + thresholds
3. Build `UserProfile` & `CareerProfile`
4. Call `runCareerClassification(...)`
5. Persist result to `assessment_results` (+ history)
6. Redirect to the assessment detail page

---

## 8. Academic Path Classification

Location: `src/lib/classification/academic-engine.ts`

### 8.1 How It Works

1. **Orientation scores** are computed from three sources:
   - **Academic scores** (mathematics, science, english, indonesian, social studies, vocational)
   - **Skill orientation boost** (competency names matched to technical / creative / analytical / communication via regex)
   - **Interest boost**

2. Scores are combined → determine **Academic Profile Type**:
   - Technical-Oriented
   - Creative-Oriented
   - Analytical-Oriented
   - Communication-Oriented
   - Multidisciplinary (when scores are spread)

3. **Education Path Matching**: each education path has `profile_tags`. Compatibility is calculated from how well those tags match the user's orientation scores. Every recommendation includes **contributing factors** (not just a number).

---

## 9. Competency Level Rubric

Location: `src/lib/classification/level-rubric.ts`

Levels 1–5 have descriptions + example evidence:

| Level | Label | Essence |
|-------|-------|---------|
| 1 | Aware / Beginner | Knows basic concepts, still needs guidance |
| 2 | Guided Practitioner | Can finish small tasks with tutorials |
| 3 | Independent Practitioner | Can complete a project from scratch to finish alone |
| 4 | Advanced / Mentor | Handles complex cases; others start asking for help |
| 5 | Expert / Leader | Sets standards, leads projects, work is publicly recognized |

Rubrics can be overridden per category from the `competency_rubrics` table. Users are asked to attach **evidence** (project/experience) when choosing a level so self-ratings are not empty of context.

---

## 10. Profile Completeness & Confidence

Location: `src/lib/profile-completeness.ts` + logic inside the engine

**Profile Completeness** (0–100) is calculated from:

| Component | Weight |
|-----------|--------|
| Academic data filled | 25% |
| Skills (≥8 ideal) | 30% |
| Experiences (≥3 ideal) | 25% |
| Interests (≥3 ideal) | 20% |

**Confidence** (HIGH / MEDIUM / LOW) is influenced by completeness. When data is limited, the UI shows a **Limited Data** warning.

> Confidence is **not** a probability of career success.

---

## 11. Career Library & Comparison

- Career Library: list of active careers (Software Engineer, Frontend/Backend/Full-Stack Developer, Game Developer, Data Analyst/Scientist, UI/UX Designer, Cybersecurity Analyst, Product Designer/Manager, etc.)
- Each career has: description, competency requirements + weights, recommended learning areas, optional experience requirements
- **Compare Careers** (`/dashboard/careers/compare`): side-by-side comparison of 2+ careers based on competency matching. Explanations of differences, not just numbers.
- **Decision Explorer** (concept): users can create multiple target scenarios and see gap trade-offs across them.

Admins can add/edit careers & requirements without redeploying code.

---

## 12. Action Plan & Progress Tracking

After gap analysis:

- Action Plan is prioritized by competency **weight** + **gap size**
- Each item: current level → target level + suggested action
- User updates a competency level → runs reassessment
- **Classification history** is stored → Progress page shows readiness score changes over time (chart)

---

## 13. Sharing, Counselor & Feedback

### Sharing

- User creates a share link (token) for a specific assessment
- Privacy: the user controls which assessments are shared
- Counselors access via `/counselor/shared/[token]` or the shared list

### Counselor

- Guard: role must be `counselor`, `mentor`, or `admin`
- Can view student profile, assessment, and gaps
- Answers student questions (`ask-counselor` → `counselor/questions`)

### Feedback

After an assessment, the user can leave feedback (helpful / not + reason). Feedback is stored for the evaluation system.

### Audit Log

Important changes (e.g. updating a career requirement weight) are recorded: actor, action, target, previous value, new value, timestamp.

---

## 14. Admin Panel & Configuration

Route group: `/admin/*`

| Page | Purpose |
|------|---------|
| `/admin` | Overview |
| `/admin/careers` | CRUD careers + requirements manager |
| `/admin/competencies` | Manage competencies |
| `/admin/rules` | Edit classification thresholds |
| `/admin/users` | User list & roles |
| `/admin/assessments` | All assessment records |
| `/admin/analytics` | Platform analytics |
| `/admin/audit` | Audit log |

All admin actions go through Server Actions in `src/lib/actions/admin.ts` with a `requireAdmin()` guard. Thresholds are read from `classification_rules` so the engine can be tested/changed without touching source code.

---

## 15. AI Integration

Location: `src/lib/actions/ai.ts` + page `/dashboard/ask-ai`

- Provider: DeepSeek (`DEEPSEEK_API_KEY`, model `deepseek-chat`)
- AI helps with: interpreting assessments, explaining gaps, study suggestions, normalizing competencies
- **Important principle**: AI does **not** determine classification. The Classification Engine remains deterministic & traceable. AI is only an interpretation/assistance layer.
- Context sent to AI: name, focus, recent assessments, sample skills (so answers are personalized)

The system prompt emphasizes practical, honest answers, no hype, and no outcome guarantees.

---

## 16. Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  Next.js App Router (Server Components + Client Components) │
│  shadcn/ui + Tailwind + Recharts                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Server Actions / RSC
┌──────────────────────────▼──────────────────────────────────┐
│                     Domain Logic                            │
│  Classification Engine (career + academic)                  │
│  Profile Loader · Rules · Level Rubric · Compare            │
│  Profile Completeness · Guards (role)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Data Access Layer                         │
│  Supabase Client (SSR) · Admin Client (service role)        │
│  PostgreSQL + Auth + RLS                                    │
└─────────────────────────────────────────────────────────────┘
```

**Modular principles:**

- UI, domain logic, classification engine, data access, AI, validation, and recommendation are **separated**
- The classification engine can be tested independently of the UI
- No “god file” that mixes everything together

---

## 17. Folder Structure

```
src/
├── app/
│   ├── (auth)/                  # Login & Register
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Auth guard (must be logged in)
│   │   ├── admin/               # Admin-only (role guard in layout)
│   │   │   ├── careers/
│   │   │   ├── competencies/
│   │   │   ├── rules/
│   │   │   ├── users/
│   │   │   ├── assessments/
│   │   │   ├── analytics/
│   │   │   └── audit/
│   │   ├── counselor/           # Counselor/Mentor
│   │   │   ├── students/
│   │   │   ├── assessments/
│   │   │   ├── shared/
│   │   │   └── questions/
│   │   └── dashboard/           # Student
│   │       ├── page.tsx         # Overview dashboard
│   │       ├── profile/
│   │       ├── academic/
│   │       ├── careers/
│   │       │   └── compare/
│   │       ├── assessment/
│   │       ├── progress/
│   │       ├── share/
│   │       ├── ask-ai/
│   │       ├── ask-counselor/
│   │       └── documentation/
│   ├── auth/callback/           # Supabase OAuth callback
│   ├── share/[token]/          # Public share view
│   ├── page.tsx                 # Landing page
│   └── layout.tsx
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── dashboard/               # Sidebar, nav, header
│   ├── assessment/              # Gap table, score, action plan, badge…
│   ├── profile/
│   ├── admin/
│   ├── counselor/
│   ├── ai/
│   └── auth/
└── lib/
    ├── classification/          # ★ Product core
    │   ├── engine.ts            # Career readiness classification
    │   ├── academic-engine.ts   # Academic path classification
    │   ├── rules.ts             # Thresholds + load from DB
    │   ├── types.ts
    │   ├── academic-types.ts
    │   ├── level-rubric.ts
    │   ├── profile-loader.ts
    │   └── compare.ts
    ├── actions/                 # Server Actions
    │   ├── assesments.ts
    │   ├── academic.ts
    │   ├── admin.ts
    │   ├── ai.ts
    │   ├── counselor.ts
    │   ├── share.ts
    │   ├── questions.ts
    │   └── feedback.ts
    ├── auth/
    ├── counselor/guards.ts
    ├── supabase/                # client, server, admin, middleware
    ├── profile-completeness.ts
    └── utils.ts
```

---

## 18. Database Schema (Conceptual)

Main tables used by the system:

| Table | Purpose |
|-------|---------|
| `profiles` | User profile + role (student/counselor/admin) |
| `academic_records` | Grades per subject |
| `competencies` | Master competency list |
| `user_competencies` | Level + evidence per user |
| `competency_rubrics` | Level descriptions per category |
| `experiences` | Projects, competitions, organizations, internships, certificates |
| `user_interests` | User interests |
| `careers` | Career library |
| `career_competencies` | Requirements + weight + is_core per career |
| `education_paths` | Education paths + profile_tags |
| `assessment_results` | Classification results + score + gaps (JSON) + history |
| `classification_rules` | Admin-editable thresholds |
| `action_plans` / progress | (or stored inside assessment_results) |
| `shared_assessments` | Share tokens + permissions |
| `feedback` | User feedback on assessments |
| `audit_logs` | Important changes (actor, action, before/after) |
| `questions` / counselor messages | Student ↔ counselor Q&A |

Schema can be simplified or extended; RLS (Row Level Security) is enabled so users only see their own data except via share tokens or elevated roles.

---

## 19. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend / App | **Next.js 16** (App Router, Server Components, Server Actions), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Lucide icons, Recharts |
| Backend / DB | **Supabase** (PostgreSQL, Auth, Row Level Security, Storage if needed) |
| AI (optional) | DeepSeek Chat API |
| Deploy | Vercel (env vars for credentials) |

---

## 20. Setup & Running the Project

### Prerequisites

- Node.js 20+
- A Supabase account (project + tables matching the schema)
- (Optional) DeepSeek API key for the Ask AI feature

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Prepare environment variables (see next section)
cp .env.example .env.local
# fill in the required values

# 3. Ensure the Supabase schema is created + RLS policies are active
#    (migrations / SQL editor in the Supabase dashboard)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |

---

## 21. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side / admin client only

# AI (optional)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
```

**Do not** commit `.env.local` to the repository.

---

## 22. UX & Design Principles

- Feels like a modern SaaS / productivity platform
- Priorities: clarity, hierarchy, readability, responsive layout
- Every visual (card, chart, badge) must have a **purpose** — avoid filling the dashboard with cards just because they look “modern”
- Classification states are clear (color + label)
- Useful empty states, loading states, and error states
- Accessible forms
- Wording always preserves the distinction: *decision support*, not prediction

Landing page hero:

> **Horyzon** — Turn complex data into actionable classifications and decisions.  
> Understand where you are, identify the gaps, and explore where you can go next.

Visual journey: **Your Data → Your Profile → Classification → Gap Analysis → Your Next Horizon**

---

## 23. Demo Scenario

The main demo uses one fictional student with academic data, skills, experience, and target **Full-Stack Developer**:

1. Create profile  
2. Enter academic data  
3. Add skills + evidence  
4. Select target career (Full-Stack Developer)  
5. Run assessment → Classification + Explanation  
6. Show competency gap analysis  
7. Show recommended action plan  
8. Update one competency  
9. Run reassessment  
10. Show progress (classification history)

---

## 24. Success Criteria

Horyzon is considered successful if a user can:

1. Build a structured academic & competency profile  
2. Define interests and goals  
3. Explore education paths  
4. Select a target career and run a classification assessment  
5. Understand the classification and the factors that influence it  
6. Identify competency gaps  
7. Compare multiple career paths  
8. Receive actionable recommendations and build an action plan  
9. Track progress and perform reassessments  
10. Compare historical assessments  
11. Share an assessment with a mentor and receive feedback  
12. Understand data completeness  
13. Access the platform according to their role  
14. Allow admins to modify career requirements & thresholds  
15. Understand that results are **decision support**, not a guarantee of future success  

---

## 25. Limitations & Disclaimer

- Classification quality is only as good as the data the user provides. Self-ratings without evidence reduce insight quality.
- The system **does not** guarantee university admission, job offers, or career success.
- The AI assistant is for interpretation help only; it **does not** replace a human counselor for personal/mental-health issues.
- Default thresholds (85 / 70 / 50) are a starting point; admins should adjust them to the institutional context.

---

## One-Sentence Summary

**Horyzon turns fragmented academic, skill, experience, and career-target data into structured intelligence** — so users know where they are, what they already have, what is still missing, what different paths require, and what they can do next.

---

*Core philosophy: Turn complex data into actionable classifications and decisions.*  
*Central question: “Where are you now, and what's your next horizon?”*

— End of HORYZON README ENGLISH —


# HORYZON

**Academic & Career Decision Intelligence Platform**

> *Turn complex data into actionable classifications and decisions.*  
> *Where are you now, and what's your next horizon?*

Horyzon adalah platform Decision Intelligence berbasis Next.js yang membantu siswa, mahasiswa, dan career counselor memahami posisi akademik & kompetensi saat ini, mengidentifikasi gap terhadap target karier/jalur pendidikan, dan merumuskan langkah konkret selanjutnya.

Platform ini **bukan** prediktor masa depan. Classification yang dihasilkan adalah *decision support* berbasis data aktual pengguna — bukan jaminan bahwa seseorang akan diterima di universitas tertentu atau berhasil mendapatkan pekerjaan.

---

## Daftar Isi

1. [Filosofi Produk](#1-filosofi-produk)
2. [Masalah yang Diselesaikan](#2-masalah-yang-diselesaikan)
3. [Core Flow](#3-core-flow)
4. [Dua Modul Inti](#4-dua-modul-inti)
5. [Role System](#5-role-system)
6. [Workflow Detail per Role](#6-workflow-detail-per-role)
7. [Classification Engine (Career Readiness)](#7-classification-engine-career-readiness)
8. [Academic Path Classification](#8-academic-path-classification)
9. [Competency Level Rubric](#9-competency-level-rubric)
10. [Profile Completeness & Confidence](#10-profile-completeness--confidence)
11. [Career Library & Comparison](#11-career-library--comparison)
12. [Action Plan & Progress Tracking](#12-action-plan--progress-tracking)
13. [Sharing, Counselor & Feedback](#13-sharing-counselor--feedback)
14. [Admin Panel & Konfigurasi](#14-admin-panel--konfigurasi)
15. [AI Integration](#15-ai-integration)
16. [Arsitektur Teknis](#16-arsitektur-teknis)
17. [Struktur Folder](#17-struktur-folder)
18. [Database Schema (Konseptual)](#18-database-schema-konseptual)
19. [Tech Stack](#19-tech-stack)
20. [Setup & Menjalankan Project](#20-setup--menjalankan-project)
21. [Environment Variables](#21-environment-variables)
22. [UX & Design Principles](#22-ux--design-principles)
23. [Demo Scenario](#23-demo-scenario)
24. [Success Criteria](#24-success-criteria)
25. [Batasan & Disclaimer](#25-batasan--disclaimer)

---

## 1. Filosofi Produk

Horyzon dibangun di atas dua prinsip utama:

1. **Classification is not prediction**  
   Sistem tidak pernah mengklaim: *"You will become a successful developer."*  
   Sistem mengatakan: *"Based on the competency requirements and the information you provided, your current profile is classified as Ready With Gaps."*

2. **Keputusan akhir tetap di tangan user**  
   Horyzon tidak memberitahu: *"This is the career you should choose."*  
   Horyzon memberitahu: *"Here is what your current data suggests, here is how your profile compares with the requirements, here are the gaps, and here are the paths you can explore."*

Setiap hasil classification, readiness score, gap analysis, dan recommendation **harus dapat dijelaskan** dari data aktual pengguna — bukan angka acak atau hardcoded.

---

## 2. Masalah yang Diselesaikan

Memilih jalur pendidikan dan karier adalah keputusan kompleks. Seorang siswa biasanya memiliki:

- Nilai akademik
- Skill teknis / non-teknis
- Project pribadi
- Pengalaman organisasi / kompetisi
- Sertifikat
- Minat dan tujuan karier

Namun seluruh data tersebut **tersebar** dan sulit digunakan untuk menjawab pertanyaan objektif:

> *"Saya tertarik dengan bidang ini"* ≠ *"Saya memiliki kompetensi yang dibutuhkan untuk mengejar bidang ini."*

Horyzon menjembatani perbedaan tersebut dengan mengubah data yang terfragmentasi menjadi **structured intelligence** yang actionable.

---

## 3. Core Flow

```
User Data
   ↓
Profile Analysis
   ↓
Classification (Academic + Career)
   ↓
Explanation (berdasarkan data aktual)
   ↓
Gap Analysis
   ↓
Recommendation & Action Plan
   ↓
Progress / Reassessment
```

**Classification adalah inti produk.** Semua fitur lain mendukung atau menjelaskan hasil classification.

---

## 4. Dua Modul Inti

### 4.1 Academic Path Classification

Menganalisis profil akademik, skills, experience, dan interests untuk menghasilkan:

- **Academic Profile Type**: Technical-Oriented, Creative-Oriented, Analytical-Oriented, Communication-Oriented, atau Multidisciplinary
- **Education Path Recommendations** dengan skor compatibility dan penjelasan faktor pendukung

### 4.2 Career Readiness Classification

User memilih target career → sistem membandingkan profil user dengan competency requirements career tersebut → menghasilkan:

- Readiness Score (0–100)
- Classification Level (EXPLORING → CAREER READY)
- Competency Gap Analysis
- Explanation
- Action Plan terprioritas

Kedua modul menggunakan **data profil yang sama**.

---

## 5. Role System

| Role | Akses Utama |
|------|-------------|
| **Student / User** | Membuat & mengelola profil, menjalankan assessment, melihat gap & action plan, progress, share ke mentor, tanya AI / counselor |
| **Counselor / Mentor** | Melihat profil & assessment yang dibagikan, menjawab pertanyaan siswa, memberi feedback, membantu development plan |
| **Admin** | Mengelola careers, competencies, classification rules/thresholds, users, assessment records, audit log, platform analytics |

Role disimpan di tabel `profiles.role` dan dicek di layout / server actions (guard).

---

## 6. Workflow Detail per Role

### 6.1 Student Workflow

1. **Register / Login** → Supabase Auth
2. **Lengkapi Profile** (`/dashboard/profile`)
   - Data akademik (Matematika, English, Science, Indonesian, Social Studies, Vocational)
   - Skills + level (1–5) + evidence
   - Projects, kompetisi, organisasi, internship, sertifikat
   - Interests
3. **Jalankan Academic Assessment** (`/dashboard/academic`)
   - Dapatkan Academic Profile + rekomendasi jalur pendidikan
4. **Jelajahi Career Library** (`/dashboard/careers`)
   - Baca deskripsi, competency requirements, recommended learning areas
   - Bandingkan beberapa karier (`/dashboard/careers/compare`)
5. **Pilih Target Career & Run Assessment** (`/dashboard/assessment`)
   - Readiness Score + Classification
   - Gap Table (Exceeds / Meets / Gap / Major Gap)
   - Explanation + Action Plan
6. **Update competency** → **Reassessment** → lihat progress di `/dashboard/progress`
7. **Share assessment** ke counselor via share link
8. **Ask AI** atau **Ask Counselor** untuk interpretasi hasil

### 6.2 Counselor Workflow

1. Login dengan role `counselor` / `mentor`
2. Dashboard counselor → daftar siswa / shared assessments
3. Buka assessment via token share atau daftar siswa
4. Lihat profil, gap, classification
5. Jawab pertanyaan dari siswa (`/counselor/questions`)
6. Berikan feedback / saran development plan

### 6.3 Admin Workflow

1. Login dengan role `admin`
2. Kelola **Careers** (CRUD + competency requirements + weight + is_core)
3. Kelola **Competencies** & rubric level
4. Ubah **Classification Rules / Thresholds** (tanpa ubah source code)
5. Lihat **Users**, **Assessments**, **Analytics**, **Audit Log**

---

## 7. Classification Engine (Career Readiness)

Lokasi inti: `src/lib/classification/engine.ts`

### 7.1 Input

- **UserProfile**: academic scores, skills (competencyId + level 1–5 + evidence), experiences, interests
- **CareerProfile**: daftar competency requirements (competencyId, requiredLevel, weight, is_core)
- **Thresholds** (opsional, dari DB): CAREER_READY, READY_WITH_GAPS, DEVELOPING

### 7.2 Readiness Score

```
score = Σ ( min(currentLevel / requiredLevel, 1.2) × weight ) / totalWeight × 100
```

- Rasio per competency di-cap **1.2** (yang exceeds dapat sedikit bonus)
- Skor akhir di-cap **100**
- Competency yang belum diisi user dianggap level **1** (default)

### 7.3 Classification Levels

| Level | Default Threshold | Arti |
|-------|-------------------|------|
| **CAREER_READY** | ≥ 85 | Memenuhi sebagian besar competency requirements |
| **READY_WITH_GAPS** | 70 – 84 | Sebagian besar core competencies terpenuhi, masih ada area yang perlu dikembangkan |
| **DEVELOPING** | 50 – 69 | Beberapa competency relevan ada, masih significant gaps |
| **EXPLORING** | < 50 | Masih tahap eksplorasi, limited evidence terhadap target career |

Threshold dapat diubah Admin lewat tabel `classification_rules` tanpa mengubah kode.

### 7.4 Gap Status

| Status | Kondisi |
|--------|---------|
| **EXCEEDS** | current ≥ required + 1 |
| **MEETS** | current === required |
| **GAP** | current === required − 1 |
| **MAJOR_GAP** | current ≤ required − 2 |

### 7.5 Explanation & Action Plan

Engine menghasilkan:

- **strongestAreas** — top 3 competency dengan status EXCEEDS/MEETS (diurutkan weight)
- **mainGaps** — competency dengan status GAP/MAJOR_GAP
- **summary** — teks penjelasan sesuai classification level + score
- **actionPlan** — max 5 item prioritas (diurutkan weight & gap size), berisi currentLevel → targetLevel + suggestedAction

Semua penjelasan **berasal dari data aktual**, bukan template generik tanpa konteks.

### 7.6 Pemanggilan

Server Action `runAssessment(careerId)` di `src/lib/actions/assesments.ts`:

1. Auth check
2. Load career + requirements + user competencies + academic + experiences + interests + thresholds
3. Bangun `UserProfile` & `CareerProfile`
4. Panggil `runCareerClassification(...)`
5. Simpan hasil ke `assessment_results` (+ history)
6. Redirect ke halaman detail assessment

---

## 8. Academic Path Classification

Lokasi: `src/lib/classification/academic-engine.ts`

### 8.1 Cara Kerja

1. **Orientation scores** dihitung dari 3 sumber:
   - **Academic scores** (mathematics, science, english, indonesian, social studies, vocational)
   - **Skill orientation boost** (nama competency di-match ke technical / creative / analytical / communication via regex)
   - **Interest boost**

2. Skor digabung → menentukan **Academic Profile Type**:
   - Technical-Oriented
   - Creative-Oriented
   - Analytical-Oriented
   - Communication-Oriented
   - Multidisciplinary (jika skor tersebar)

3. **Education Path Matching**: setiap education path punya `profile_tags`. Compatibility dihitung berdasarkan kesesuaian tags dengan orientation scores user. Setiap rekomendasi menyertakan **faktor yang berkontribusi** (bukan hanya angka).

---

## 9. Competency Level Rubric

Lokasi: `src/lib/classification/level-rubric.ts`

Level 1–5 memiliki deskripsi + contoh evidence:

| Level | Label | Inti |
|-------|-------|------|
| 1 | Aware / Beginner | Tahu konsep dasar, masih butuh guidance |
| 2 | Guided Practitioner | Bisa selesaikan task kecil dengan tutorial |
| 3 | Independent Practitioner | Bisa project dari nol sampai selesai sendiri |
| 4 | Advanced / Mentor | Handle kasus kompleks, orang lain mulai bertanya |
| 5 | Expert / Leader | Set standar, lead project, karya diakui publik |

Rubric bisa di-override per category dari tabel `competency_rubrics`. User diminta menyertakan **evidence** (project/pengalaman) saat memilih level agar self-rating tidak kosong konteks.

---

## 10. Profile Completeness & Confidence

Lokasi: `src/lib/profile-completeness.ts` + logika di engine

**Profile Completeness** (0–100) dihitung dari:

| Komponen | Bobot |
|----------|-------|
| Academic data terisi | 25% |
| Skills (≥8 ideal) | 30% |
| Experiences (≥3 ideal) | 25% |
| Interests (≥3 ideal) | 20% |

**Confidence** (HIGH / MEDIUM / LOW) dipengaruhi completeness. Jika data terbatas, UI menampilkan peringatan **Limited Data**.

> Confidence **bukan** probabilitas keberhasilan karier.

---

## 11. Career Library & Comparison

- Career Library: daftar karier aktif (Software Engineer, Frontend/Backend/Full-Stack Developer, Game Developer, Data Analyst/Scientist, UI/UX Designer, Cybersecurity Analyst, Product Designer/Manager, dll.)
- Setiap career punya: description, competency requirements + weight, recommended learning areas, optional experience requirements
- **Compare Careers** (`/dashboard/careers/compare`): bandingkan 2+ karier side-by-side berdasarkan competency matching. Penjelasan perbedaan, bukan hanya angka.
- **Decision Explorer** (konsep): user bisa buat beberapa scenario target dan lihat trade-off gap antar skenario.

Admin dapat menambah/mengubah career & requirements tanpa deploy ulang kode.

---

## 12. Action Plan & Progress Tracking

Setelah gap analysis:

- Action Plan diprioritaskan berdasarkan **weight** competency + **ukuran gap**
- Setiap item: current level → target level + suggested action
- User memperbarui competency level → jalankan reassessment
- **Classification history** disimpan → halaman Progress menampilkan perubahan readiness score dari waktu ke waktu (chart)

---

## 13. Sharing, Counselor & Feedback

### Sharing

- User membuat share link (token) untuk assessment tertentu
- Privacy: user mengontrol assessment mana yang dibagikan
- Counselor mengakses via `/counselor/shared/[token]` atau daftar shared

### Counselor

- Guard: role harus `counselor`, `mentor`, atau `admin`
- Bisa melihat profil siswa, assessment, gap
- Menjawab pertanyaan siswa (`ask-counselor` → `counselor/questions`)

### Feedback

Setelah assessment, user bisa memberi feedback (berguna / tidak + alasan). Feedback disimpan untuk evaluation system.

### Audit Log

Perubahan penting (mis. update career requirement weight) dicatat: actor, action, target, previous value, new value, timestamp.

---

## 14. Admin Panel & Konfigurasi

Route group: `/admin/*`

| Halaman | Fungsi |
|---------|--------|
| `/admin` | Overview |
| `/admin/careers` | CRUD careers + requirements manager |
| `/admin/competencies` | Kelola competencies |
| `/admin/rules` | Ubah classification thresholds |
| `/admin/users` | Daftar & role users |
| `/admin/assessments` | Semua assessment records |
| `/admin/analytics` | Platform analytics |
| `/admin/audit` | Audit log |

Semua aksi admin melalui Server Actions di `src/lib/actions/admin.ts` dengan `requireAdmin()` guard. Thresholds dibaca dari `classification_rules` sehingga engine bisa diuji/diubah tanpa touch source code.

---

## 15. AI Integration

Lokasi: `src/lib/actions/ai.ts` + halaman `/dashboard/ask-ai`

- Provider: DeepSeek (`DEEPSEEK_API_KEY`, model `deepseek-chat`)
- AI membantu: interpretasi assessment, penjelasan gap, saran belajar, normalisasi kompetensi
- **Prinsip penting**: AI **tidak** menentukan classification. Classification Engine tetap deterministic & traceable. AI hanya layer interpretasi/bantuan.
- Context yang dikirim ke AI: nama, focus, recent assessments, sample skills (agar jawaban personal)

System prompt menekankan: jawaban praktis, jujur, tidak hype, dan bukan jaminan outcome.

---

## 16. Arsitektur Teknis

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  Next.js App Router (Server Components + Client Components) │
│  shadcn/ui + Tailwind + Recharts                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Server Actions / RSC
┌──────────────────────────▼──────────────────────────────────┐
│                     Domain Logic                            │
│  Classification Engine (career + academic)                  │
│  Profile Loader · Rules · Level Rubric · Compare            │
│  Profile Completeness · Guards (role)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   Data Access Layer                         │
│  Supabase Client (SSR) · Admin Client (service role)        │
│  PostgreSQL + Auth + RLS                                    │
└─────────────────────────────────────────────────────────────┘
```

**Prinsip modular:**

- UI, domain logic, classification engine, data access, AI, validation, dan recommendation **dipisah**
- Classification engine dapat diuji independen dari UI
- Tidak ada “god file” yang mencampur semuanya

---

## 17. Struktur Folder

```
src/
├── app/
│   ├── (auth)/                  # Login & Register
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx           # Auth guard (harus login)
│   │   ├── admin/               # Admin-only (role guard di layout)
│   │   │   ├── careers/
│   │   │   ├── competencies/
│   │   │   ├── rules/
│   │   │   ├── users/
│   │   │   ├── assessments/
│   │   │   ├── analytics/
│   │   │   └── audit/
│   │   ├── counselor/           # Counselor/Mentor
│   │   │   ├── students/
│   │   │   ├── assessments/
│   │   │   ├── shared/
│   │   │   └── questions/
│   │   └── dashboard/           # Student
│   │       ├── page.tsx         # Overview dashboard
│   │       ├── profile/
│   │       ├── academic/
│   │       ├── careers/
│   │       │   └── compare/
│   │       ├── assessment/
│   │       ├── progress/
│   │       ├── share/
│   │       ├── ask-ai/
│   │       ├── ask-counselor/
│   │       └── documentation/
│   ├── auth/callback/           # Supabase OAuth callback
│   ├── share/[token]/          # Public share view
│   ├── page.tsx                 # Landing page
│   └── layout.tsx
├── components/
│   ├── ui/                      # shadcn primitives
│   ├── dashboard/               # Sidebar, nav, header
│   ├── assessment/              # Gap table, score, action plan, badge…
│   ├── profile/
│   ├── admin/
│   ├── counselor/
│   ├── ai/
│   └── auth/
└── lib/
    ├── classification/          # ★ Inti produk
    │   ├── engine.ts            # Career readiness classification
    │   ├── academic-engine.ts   # Academic path classification
    │   ├── rules.ts             # Thresholds + load dari DB
    │   ├── types.ts
    │   ├── academic-types.ts
    │   ├── level-rubric.ts
    │   ├── profile-loader.ts
    │   └── compare.ts
    ├── actions/                 # Server Actions
    │   ├── assesments.ts
    │   ├── academic.ts
    │   ├── admin.ts
    │   ├── ai.ts
    │   ├── counselor.ts
    │   ├── share.ts
    │   ├── questions.ts
    │   └── feedback.ts
    ├── auth/
    ├── counselor/guards.ts
    ├── supabase/                # client, server, admin, middleware
    ├── profile-completeness.ts
    └── utils.ts
```

---

## 18. Database Schema (Konseptual)

Tabel-tabel utama yang dipakai sistem:

| Tabel | Fungsi |
|-------|--------|
| `profiles` | User profile + role (student/counselor/admin) |
| `academic_records` | Nilai per mata pelajaran |
| `competencies` | Master competency |
| `user_competencies` | Level + evidence per user |
| `competency_rubrics` | Deskripsi level per category |
| `experiences` | Project, kompetisi, organisasi, internship, sertifikat |
| `user_interests` | Minat user |
| `careers` | Career library |
| `career_competencies` | Requirement + weight + is_core per career |
| `education_paths` | Jalur pendidikan + profile_tags |
| `assessment_results` | Hasil classification + score + gaps (JSON) + history |
| `classification_rules` | Threshold yang bisa diubah admin |
| `action_plans` / progress | (atau disimpan dalam assessment_results) |
| `shared_assessments` | Token share + permission |
| `feedback` | Feedback user terhadap assessment |
| `audit_logs` | Perubahan penting (actor, action, before/after) |
| `questions` / counselor messages | Tanya-jawab siswa ↔ counselor |

Schema dapat disederhanakan atau dikembangkan; RLS (Row Level Security) diaktifkan agar user hanya melihat data miliknya, kecuali lewat share token / role elevated.

---

## 19. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend / App | **Next.js 16** (App Router, Server Components, Server Actions), React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Lucide icons, Recharts |
| Backend / DB | **Supabase** (PostgreSQL, Auth, Row Level Security, Storage jika perlu) |
| AI (opsional) | DeepSeek Chat API |
| Deploy | Vercel (env vars untuk credentials) |

---

## 20. Setup & Menjalankan Project

### Prasyarat

- Node.js 20+
- Akun Supabase (project + tabel sesuai schema)
- (Opsional) API key DeepSeek untuk fitur Ask AI

### Langkah

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment variables (lihat bagian berikutnya)
cp .env.example .env.local
# isi nilai yang diperlukan

# 3. Pastikan schema Supabase sudah dibuat + RLS policy aktif
#    (migrations / SQL editor di dashboard Supabase)

# 4. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Keterangan |
|---------|------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

---

## 21. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # hanya server-side / admin client

# AI (opsional)
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
```

**Jangan** commit `.env.local` ke repository.

---

## 22. UX & Design Principles

- Terasa seperti modern SaaS / productivity platform
- Prioritas: clarity, hierarchy, readability, responsive
- Setiap visual (card, chart, badge) harus punya **tujuan** — jangan dashboard penuh card hanya karena terlihat “modern”
- Classification states jelas (warna + label)
- Empty states, loading states, error states yang berguna
- Form accessible
- Wording selalu menjaga distinction: *decision support*, bukan prediksi

Landing page hero:

> **Horyzon** — Turn complex data into actionable classifications and decisions.  
> Understand where you are, identify the gaps, and explore where you can go next.

Visual journey: **Your Data → Your Profile → Classification → Gap Analysis → Your Next Horizon**

---

## 23. Demo Scenario

Demo utama memakai satu fictional student dengan data akademik, skills, experience, dan target **Full-Stack Developer**:

1. Create profile  
2. Enter academic data  
3. Add skills + evidence  
4. Select target career (Full-Stack Developer)  
5. Run assessment → Classification + Explanation  
6. Show competency gap analysis  
7. Show recommended action plan  
8. Update satu competency  
9. Run reassessment  
10. Show progress (classification history)

---

## 24. Success Criteria

Horyzon dianggap berhasil jika user dapat:

1. Membangun structured academic & competency profile  
2. Menentukan interests dan goals  
3. Mengeksplorasi education paths  
4. Memilih target career dan menjalankan classification assessment  
5. Memahami classification dan faktor yang mempengaruhinya  
6. Mengidentifikasi competency gaps  
7. Membandingkan multiple career paths  
8. Menerima actionable recommendations dan membangun action plan  
9. Melacak progress dan melakukan reassessment  
10. Membandingkan historical assessments  
11. Membagikan assessment kepada mentor dan menerima feedback  
12. Memahami data completeness  
13. Mengakses platform sesuai role  
14. Memungkinkan admin memodifikasi career requirements & thresholds  
15. Memahami bahwa hasil adalah **decision support**, bukan jaminan kesuksesan masa depan  

---

## 25. Batasan & Disclaimer

- Hasil classification **hanya** seakurat data yang diisi user. Self-rating tanpa evidence menurunkan kualitas insight.
- Sistem **tidak** menjamin penerimaan universitas, job offer, atau kesuksesan karier.
- AI assistant bersifat bantu interpretasi; ia **tidak** menggantikan counselor manusia untuk isu personal/mental health.
- Threshold default (85 / 70 / 50) adalah starting point; admin diharapkan menyesuaikan dengan konteks institusi.

---

## Ringkasan Satu Kalimat

**Horyzon mengubah data akademik, skill, experience, dan target karier yang terfragmentasi menjadi structured intelligence** — sehingga pengguna tahu di mana mereka berada, apa yang sudah dimiliki, apa yang masih kurang, apa yang dibutuhkan berbagai jalur, dan apa yang bisa dilakukan selanjutnya.

---

*Core philosophy: Turn complex data into actionable classifications and decisions.*  
*Central question: “Where are you now, and what's your next horizon?”*

— Akhir README HORYZON —
