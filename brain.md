# PlaceIQ (KRU_SKH) — System Architecture & Concept Brain

> **Purpose:** This document is the definitive single-source architectural briefing for any AI assistant working on this codebase. It outlines the core philosophy, stakeholder domains, data flows, AI pipelines, and runtime models without superfluous code.

---

## 1. Executive Summary & Core Mission

**PlaceIQ** is an enterprise-grade AI career intelligence and campus placement ecosystem connecting three interdependent stakeholders:
1. **Students:** Master skills, detect ATS resume gaps, practice voice-AI interviews, participate in live coding evaluations, and store tamper-proof academic credentials.
2. **Companies / Recruiters:** Filter verified candidate pipelines, post drives/internships, and conduct live synchronized video + coding interviews.
3. **Institutions / Colleges:** Monitor campus hiring analytics, audit academic documents with computer vision, and trade shared campus infrastructure (labs, equipment, trainers) across partner colleges.

---

## 2. Tech Stack & Infrastructure Topology

| Layer | Technologies & Libraries | Role |
| :--- | :--- | :--- |
| **Frontend & Web Core** | Next.js 16.2.2 (App Router, ESM), React 19, TypeScript 5, Vanilla CSS Modules | Multi-portal responsive client application |
| **Database & ORM** | PostgreSQL (Supabase), Prisma ORM 5.22 (PgBouncer pooler at port 6543, direct at port 5432) | Relational multi-tenant schema with indexed queries |
| **Real-Time & Media** | Socket.IO 4.8.3, WebRTC (Simple-Peer, Daily.co) | Real-time code synchronization & P2P video/audio streams |
| **AI / NLP Reasoning** | Groq SDK (Llama-3.3-70B-Versatile, GPT-OSS) | Semantic ATS parsing, skill-gap analysis, automated code critique |
| **Voice Agent** | Vapi AI Voice Web SDK + Deepgram transcription | Conversational voice mock interviews with live transcription |
| **Document Forensics** | Python FastAPI (`docling-service` on port 8000), PyMuPDF, PaddleOCR, YOLO, DeepFace | Multi-modal OCR, face matching, ELA/noise tamper detection |
| **Email Security** | Resend API (`security@placeiq.site`) | 6-digit SHA-256 OTP delivery & adaptive new-device alerts |
| **Code Editor** | `@monaco-editor/react` | LeetCode-style code judge & collaborative interview editor |

---

## 3. High-Level System Architecture

```
                                  +-------------------------------------------------------+
                                  |                 PlaceIQ Client (Next.js 16)           |
                                  |      /student        |      /company    | /institution |
                                  +-------------------------------------------------------+
                                          |                         |                |
                                     REST / Actions             WebSockets       WebRTC (P2P)
                                          |                         |                |
+-----------------------------------------v-------------------------v----------------v----+
| Unified Server (Node.js + Socket.IO: port 3000 / standalone socket-server: port 3001)   |
+-----------------------------------------------------------------------------------------+
       |                                |                            |              |
+------v-------+              +---------v---------+          +-------v------+ +-----v------+
| PostgreSQL   |              | Groq Llama 3.3    |          | Vapi AI      | | Docling    |
| (Supabase    |              | AI Reasoning      |          | Voice Agent  | | Python CV  |
| + Prisma)    |              | (ATS, Skill Gaps) |          | (Interviews) | | (Forensics)|
+--------------+              +-------------------+          +--------------+ +------------+
```

---

## 4. Stakeholder Domains & Capabilities

### 🎓 1. Student Portal (`/student`)
* **AI Resume & ATS Score (`/student/resume`):** Deep PDF parsing via `pdf-parse`/Groq; scores formatting, keywords, impact metrics, and outputs actionable rewrite suggestions.
* **Semantic Skill Gap Detector (`/student/skill-gap`):** Compares student profile against live industry requirements retrieved via Serper API.
* **4-Week AI Learning Roadmap (`/student/roadmap`):** Day-by-day dynamic schedule with curated documentation links and YouTube queries.
* **AI Voice Mock Interview (`/student/mock-interview`):** Interactive voice interview powered by Vapi AI; conducts STAR methodology evaluations and generates downloadable PDF reports.
* **Behavioral Analysis (`/student/behavioral-analysis`):** Live webcam snapshot stream analyzing non-verbal gestures, confidence score, and communication metrics.
* **Real-Time Coding Judge (`/student/coding-judge`):** Monaco code editor with C++, Python, Java syntax execution, custom test case runners, and AI performance advice.
* **Verified Document Vault (`/student/documents`, `/student/verify-academics`):** Academic marksheet upload with automated OCR grade calculation, tamper checks, and DigiLocker verification badges.
* **Dream Company Preparation (`/student/dream-mode`):** Company-tailored preparation paths for Tier-1 firms (Google, Amazon, Microsoft).

### 🏢 2. Company / Recruiter Portal (`/company`)
* **Candidate Intelligence (`/company/candidates`):** Multi-factor filtering across verified CGPA, 10th/12th percentages, skill-match scores, and pre-defined role presets (`ROLE_PRESETS`).
* **Live Coding Interview Room (`/company/coding-judge`):**
  * Synchronized Monaco editor state across candidate and interviewer via Socket.IO rooms.
  * Embedded WebRTC peer-to-peer audio/video streaming.
  * Live candidate evaluation rubric (scored out of 100) submitted directly into student records.
* **Placement & Internship Drives (`/company/internships`, `/company/dashboard`):** Post openings, establish academic cutoffs, manage shortlists, and roll out offers.

### 🏛️ 3. Institution / College Portal (`/institution`)
* **Ecosystem Analytics (`/institution/dashboard`, `/institution/placements`):** Visual dashboards tracking hiring ratios, department performance, active drives, and student placement risk.
* **Inter-College Resource Sharing (`/institution/resources`):** Cross-institutional booking exchange allowing partner colleges to lease computer labs, specialized hardware, and event halls.
* **Trainer & Workshop Directory (`/institution/trainers`):** Management and rating system for technical faculty and corporate trainers.
* **Document Audit Center (`/institution/documents`, `/institution/certifications`):** Administrative inspection queue for academic documents flagging detected tamper anomalies.

---

## 5. Security & Authentication Architecture

PlaceIQ implements an **Intelligent Login Shield**:

```
[User Sign-in Attempt]
         |
[1. clientDevice.ts] ------> Resolve real Browser, OS, and Client IP
         |
[2. loginRiskEngine.ts] ---> Risk Assessment Heuristics:
                             - Unknown Device / Fingerprint Mismatch
                             - Impossible Travel Velocity (>800 km/h)
                             - Consecutive Failed Password Attempts (>5 = Lockout)
         |
     Risk Level?
     /        \
 [LOW]       [MEDIUM / HIGH]
   |                \
Issue JWT            Dispatch 6-digit SHA-256 OTP via Resend
Session Cookie       User Verifies OTP -> Option: "Trust This Device (7 Days)"
                     If trusted: stores placeiq_trusted_device cookie
```

* **Session Token:** Signed JWT (`SESSION_SECRET`) stored in HTTP-only secure cookie `demo_session`.
* **Password Hashing:** Automated transparent upgrade from legacy hashes to 12-round salted `bcrypt` on authenticated login.
* **Vault Cryptography:** AES-256 document encryption (`DOCUMENT_ENCRYPTION_KEY`) for secure asset storage in Supabase.

---

## 6. Core Database Schema Relationships (Prisma)

```
[Institution] <----+ (1:N)
                   |
             [Student] <-----+ (1:N)
             |   |   |       |
             |   |   +--> [Document] (Academic marks, Degree, DigiLocker verified)
             |   |   +--> [Resume] (ATS score, Extracted skills, Raw JSON)
             |   +------> [JobApplication] ----> [PlacementDrive] <----+ (1:N)
             |                                                         |
             +----------> [AcademicMarksheet]                      [Company]
             |
             +----------> [CodingRoomSession] (Scores, Interview Notes)
             |
             +----------> [CourseEnrollment] ----> [Course] (LMS)
```

* **Key Entities:**
  * `Student`, `Company`, `Institution`, `Trainer`: Primary platform actors.
  * `Document` & `AcademicMarksheet`: Verified academic records with OCR extracted grades and SHA-256 verification hash.
  * `PlacementDrive` & `JobApplication`: Recruitment lifecycle with real-time status tracking (`applied`, `shortlisted`, `interview_scheduled`, `offered`).
  * `SharedResource` & `ResourceBooking`: Multi-college infrastructure marketplace.

---

## 7. Operational Modes & Commands

* **Development (Next.js + Socket.IO):**
  ```bash
  npm run dev          # Next.js (port 3000) + Socket Server (port 3001) concurrently
  npm run dev:all      # Next.js + Socket Server + Python Docling service
  ```
* **Production Deployment (Railway / Containerized):**
  ```bash
  npm run build        # Compiles Next.js bundle
  npm start            # Runs server/server.js (Unified HTTP + Next.js + Socket.IO on single port)
  ```
* **Database & Schema Updates:**
  ```bash
  npx prisma generate  # Updates generated client at src/generated/prisma-client-v5
  npx prisma db push   # Syncs schema directly to Supabase PostgreSQL
  ```

---

## 8. Development Rules for AI Agents

1. **Next.js Conventions:** This project uses modern Next.js App Router (ESM). Check deprecations before proposing middleware or config changes.
2. **Styling Paradigm:** Use **Vanilla CSS Modules** (`.module.css`) matching the glassmorphic dark-mode design system. Do not introduce Tailwind unless explicitly requested.
3. **Environment Isolation:** Never hardcode secrets. All runtime config must resolve through `process.env` backed by root `.env`. Standalone node scripts should initialize `@next/env`.
4. **Data Access Integrity:** Always access PostgreSQL via the centralized singleton at `src/lib/prisma.ts`.
