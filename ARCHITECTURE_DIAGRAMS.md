# SwipeSavvy Platform — Architecture Diagrams

**Generated**: 2026-01-06
**Purpose**: Visual representation of system topology, data flows, and service interactions

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        MobileApp["📱 Mobile App<br/>(React Native + Expo)<br/>iOS/Android<br/>Port: 8081"]
        AdminPortal["🖥️ Admin Portal<br/>(React + Vite)<br/>Web Dashboard<br/>Port: 5173"]
    end

    subgraph "API Gateway Layer"
        Gateway["🌐 API Gateway<br/>(Nginx)<br/>Port: 80"]
    end

    subgraph "Backend Services Layer"
        AIAgent["🤖 AI Agents Platform<br/>(FastAPI + Python)<br/>Port: 8000"]

        subgraph "AI Microservices"
            Concierge["💬 Concierge Service<br/>Port: 8000"]
            RAG["📚 RAG Service<br/>Port: 8001"]
            Guardrails["🛡️ Guardrails Service<br/>Port: 8002"]
        end
    end

    subgraph "Data Layer"
        Postgres[("🗄️ PostgreSQL<br/>Database<br/>Port: 5432")]
        Redis[("⚡ Redis<br/>Cache<br/>Port: 6379")]
        Vector[("🔍 pgvector<br/>Embeddings")]
    end

    subgraph "External Services"
        TogetherAI["🧠 Together.AI<br/>LLM API"]
        OpenAI["🤖 OpenAI<br/>Embeddings"]
    end

    MobileApp -->|HTTP/WS| Gateway
    AdminPortal -->|HTTP| Gateway
    Gateway -->|Proxy| AIAgent

    AIAgent --> Concierge
    AIAgent --> RAG
    AIAgent --> Guardrails

    Concierge --> Postgres
    Concierge --> Redis
    RAG --> Postgres
    RAG --> Vector
    Guardrails --> Redis

    Concierge -->|API Calls| TogetherAI
    RAG -->|Embeddings| OpenAI

    style MobileApp fill:#4CAF50
    style AdminPortal fill:#2196F3
    style Gateway fill:#FF9800
    style AIAgent fill:#9C27B0
    style Postgres fill:#00BCD4
    style Redis fill:#F44336
    style TogetherAI fill:#E91E63
```

---

## 2. Current State vs Ideal State

### Current State (Problematic)

```mermaid
graph LR
    subgraph "Current Monorepo Structure"
        Root["📦 Root package.json<br/>❌ Claims to be admin-portal<br/>❌ Has React Native deps<br/>❌ Has Vite deps<br/>❌ React 19.1.0<br/>❌ Metro + Vite bundlers"]

        AdminDir["📁 swipesavvy-admin-portal/<br/>✅ Actual admin portal<br/>✅ React 18.2.0<br/>✅ Vite bundler"]

        AIDir["📁 swipesavvy-ai-agents/<br/>✅ Python FastAPI<br/>✅ 4 microservices"]
    end

    style Root fill:#f44336,color:#fff
    style AdminDir fill:#4CAF50
    style AIDir fill:#4CAF50
```

### Ideal State (After Fixes)

```mermaid
graph LR
    subgraph "Fixed Monorepo Structure"
        RootFixed["📦 Root package.json<br/>✅ Name: swipesavvy-mobile-app<br/>✅ React 18.2.0<br/>✅ Metro bundler only<br/>✅ React Native deps only"]

        AdminDirFixed["📁 swipesavvy-admin-portal/<br/>✅ React 18.2.0<br/>✅ Vite bundler<br/>✅ Admin deps only"]

        AIDirFixed["📁 swipesavvy-ai-agents/<br/>✅ Python 3.11<br/>✅ Pinned dependencies<br/>✅ 4 microservices"]
    end

    style RootFixed fill:#4CAF50
    style AdminDirFixed fill:#4CAF50
    style AIDirFixed fill:#4CAF50
```

---

## 3. Service Communication Flow

```mermaid
sequenceDiagram
    actor User
    participant Mobile as 📱 Mobile App
    participant Admin as 🖥️ Admin Portal
    participant Gateway as 🌐 API Gateway
    participant AI as 🤖 AI Agents
    participant DB as 🗄️ PostgreSQL
    participant Cache as ⚡ Redis
    participant LLM as 🧠 Together.AI

    User->>Mobile: Open app
    Mobile->>Gateway: GET /api/health
    Gateway->>AI: Forward request
    AI->>DB: Check connection
    AI->>Cache: Check connection
    AI-->>Gateway: 200 OK
    Gateway-->>Mobile: Health status

    User->>Mobile: Ask AI question
    Mobile->>Gateway: POST /api/ai/chat
    Gateway->>AI: Forward chat request
    AI->>Cache: Check cache
    Cache-->>AI: Cache miss
    AI->>LLM: Call Together.AI API
    LLM-->>AI: AI response
    AI->>DB: Save conversation
    AI->>Cache: Cache response
    AI-->>Gateway: Return response
    Gateway-->>Mobile: Display answer

    Admin->>Admin: View dashboard
    Admin->>Gateway: GET /api/admin/dashboard
    Gateway->>AI: Forward request
    AI->>DB: Query metrics
    AI->>Cache: Get cached data
    Cache-->>AI: Return cached metrics
    AI-->>Gateway: Dashboard data
    Gateway-->>Admin: Render dashboard
```

---

## 4. Dependency Conflict Visualization

```mermaid
graph TD
    subgraph "Root Mobile App"
        R_React["React 19.1.0<br/>❌ WRONG"]
        R_RN["React Native 0.81.5<br/>Requires React 18.x"]
        R_Vite["Vite 5.4.21<br/>❌ WRONG (web bundler)"]
        R_Metro["Metro<br/>✅ CORRECT (RN bundler)"]
    end

    subgraph "Admin Portal"
        A_React["React 18.2.0<br/>✅ CORRECT"]
        A_Vite["Vite 5.4.11<br/>✅ CORRECT"]
    end

    R_React -.->|"INCOMPATIBLE"| R_RN
    R_Vite -.->|"CONFLICT"| R_Metro
    R_React -.->|"VERSION MISMATCH"| A_React

    style R_React fill:#f44336,color:#fff
    style R_Vite fill:#f44336,color:#fff
    style R_RN fill:#ff9800
    style A_React fill:#4CAF50
    style A_Vite fill:#4CAF50
    style R_Metro fill:#4CAF50
```

---

## 5. Build Pipeline Flow

```mermaid
graph LR
    subgraph "Local Development"
        Dev["👨‍💻 Developer"]
        LocalNode["Node 24.10.0<br/>❌ MISMATCH"]
    end

    subgraph "Git Repository"
        Commit["Git Commit"]
        nvmrc[".nvmrc: 20.13.0"]
    end

    subgraph "CI/CD Pipeline"
        CI["GitLab CI"]
        CINode["Node 18<br/>❌ MISMATCH"]
    end

    subgraph "Production"
        Prod["Production Server"]
        ProdNode["Node ?<br/>❓ UNKNOWN"]
    end

    Dev -->|"Push code"| Commit
    Commit -->|"Trigger"| CI
    CI -->|"Build"| CINode
    CINode -->|"Deploy"| Prod

    nvmrc -.->|"Should enforce"| LocalNode
    nvmrc -.->|"Should match"| CINode
    nvmrc -.->|"Should match"| ProdNode

    style LocalNode fill:#f44336,color:#fff
    style CINode fill:#f44336,color:#fff
    style ProdNode fill:#ff9800
    style nvmrc fill:#4CAF50
```

---

## 6. Data Flow — AI Chat Feature

```mermaid
flowchart TD
    Start([User asks question])

    Frontend[Mobile App/Admin Portal]

    Gateway{API Gateway<br/>Route request}

    AIService[AI Agents Service]

    CheckCache{Check Redis<br/>Cache}

    CacheHit[Return cached<br/>response]

    CheckGuardrails[Guardrails Service<br/>PII detection]

    GuardrailsFail[Block request<br/>Contains PII]

    RAGQuery[RAG Service<br/>Vector search]

    LLMCall[Together.AI<br/>Generate response]

    SaveDB[(Save to<br/>PostgreSQL)]

    UpdateCache[(Update<br/>Redis cache)]

    Response([Return to user])

    Start --> Frontend
    Frontend --> Gateway
    Gateway --> AIService
    AIService --> CheckCache

    CheckCache -->|Hit| CacheHit
    CheckCache -->|Miss| CheckGuardrails

    CheckGuardrails -->|Contains PII| GuardrailsFail
    CheckGuardrails -->|Safe| RAGQuery

    RAGQuery --> LLMCall
    LLMCall --> SaveDB
    SaveDB --> UpdateCache
    UpdateCache --> Response

    CacheHit --> Response
    GuardrailsFail --> Response

    Response --> Frontend

    style Start fill:#2196F3
    style GuardrailsFail fill:#f44336,color:#fff
    style CacheHit fill:#4CAF50
    style Response fill:#4CAF50
```

---

## 7. Environment Configuration Flow

```mermaid
graph TD
    subgraph "Environment Files"
        EnvExample[".env.example<br/>✅ Template (safe to commit)"]
        EnvLocal[".env<br/>❌ Contains secrets<br/>❌ WAS committed<br/>🔒 NOW in .gitignore"]
        EnvProd[".env.production<br/>🔒 Secrets Manager"]
    end

    subgraph "Secret Sources"
        AWS["AWS Secrets Manager<br/>✅ Production secrets"]
        GitLabVars["GitLab CI Variables<br/>✅ CI/CD secrets"]
        Local["Local developer<br/>🔑 Personal keys"]
    end

    subgraph "Applications"
        App["Application Code"]
        CI["CI/CD Pipeline"]
    end

    EnvExample -->|"Copy to"| EnvLocal
    Local -->|"Fill in"| EnvLocal
    EnvLocal -->|"Reads (dev)"| App

    AWS -->|"Inject (prod)"| App
    GitLabVars -->|"Inject"| CI
    EnvProd -.->|"Template only"| AWS

    style EnvLocal fill:#f44336,color:#fff
    style EnvExample fill:#4CAF50
    style AWS fill:#4CAF50
    style GitLabVars fill:#4CAF50
```

---

## 8. Docker Compose Service Map

```mermaid
graph TB
    subgraph "Docker Network: swipesavvy-network"
        subgraph "Frontend Services"
            Mobile["mobile-app<br/>❌ Context: ./swipesavvy-mobile-app<br/>(DOES NOT EXIST)"]
            Admin["admin-portal<br/>✅ Context: ./swipesavvy-admin-portal<br/>Port: 3000"]
        end

        subgraph "Backend Services"
            AI["ai-agent<br/>✅ Context: ./swipesavvy-ai-agents<br/>Port: 8000"]
            Wallet["mobile-wallet<br/>❌ Context: ./swipesavvy-mobile-wallet<br/>(DOES NOT EXIST)"]
            Website["customer-website<br/>❌ Context: ./swipesavvy-customer-website<br/>(DOES NOT EXIST)"]
        end

        subgraph "Infrastructure"
            Gateway["api-gateway<br/>✅ Nginx<br/>Port: 80"]
            DB["postgres<br/>✅ PostgreSQL 15<br/>Port: 5432"]
            Cache["redis<br/>✅ Redis 7<br/>Port: 6379"]
            Mongo["mongodb<br/>⚠️ Unused?<br/>Port: 27017"]
        end
    end

    Mobile -.->|"BROKEN"| Gateway
    Admin --> Gateway
    AI --> DB
    AI --> Cache
    Wallet -.->|"BROKEN"| Gateway
    Website -.->|"BROKEN"| Gateway
    Gateway --> AI

    style Mobile fill:#f44336,color:#fff
    style Wallet fill:#f44336,color:#fff
    style Website fill:#f44336,color:#fff
    style Mongo fill:#ff9800
    style Admin fill:#4CAF50
    style AI fill:#4CAF50
    style Gateway fill:#4CAF50
    style DB fill:#4CAF50
    style Cache fill:#4CAF50
```

---

## 9. TypeScript Configuration Hierarchy

```mermaid
graph TD
    subgraph "Root (Mobile App)"
        RootTS["tsconfig.json"]
        RootNode["tsconfig.node.json"]
        Expo["expo/tsconfig.base<br/>❌ INHERITED"]
    end

    subgraph "Admin Portal"
        AdminApp["tsconfig.app.json<br/>strict: true ✅"]
        AdminNode["tsconfig.node.json<br/>strict: true ✅"]
        AdminMain["tsconfig.json<br/>References above"]
    end

    RootTS -->|extends| Expo
    RootTS -.->|"strict: false ❌"| Conflict
    AdminApp -.->|"strict: true ✅"| Conflict

    AdminMain -->|references| AdminApp
    AdminMain -->|references| AdminNode

    Conflict["⚠️ Strict Mode Mismatch"]

    style Expo fill:#ff9800
    style Conflict fill:#f44336,color:#fff
    style AdminApp fill:#4CAF50
    style AdminNode fill:#4CAF50
```

---

## 10. PR Dependency Graph (26-PR Rollout Plan)

```mermaid
graph TD
    PR1["PR#1: Environment<br/>Rotate keys, .gitignore<br/>Node 20.13.0"] --> PR2
    PR1 --> PR3
    PR1 --> PR6
    PR1 --> PR7

    PR2["PR#2: React Downgrade<br/>18.2.0 for RN compat"] --> PR4
    PR2 --> PR8

    PR3["PR#3: Package Identity<br/>Rename to mobile-app"] --> PR5
    PR3 --> PR9

    PR4["PR#4: TS Errors<br/>Fix FeatureFlagsPage"]

    PR5["PR#5: Docker Paths<br/>Fix compose.yml"]

    PR6["PR#6: ESLint<br/>Remove duplicate config"]

    PR7["PR#7: CI Paths<br/>Fix GitLab CI"]

    PR8["PR#8: TS Strict<br/>Enable strict mode"] --> PR11

    PR9["PR#9: Dep Alignment<br/>Standardize versions"] --> PR11

    PR4 --> PR10
    PR10["PR#10: API URLs<br/>Standardize endpoints"]

    PR11["PR#11: TS Config<br/>Unify configs"] --> PR12

    PR10 --> PR13
    PR12["PR#12: Path Sync<br/>Metro + TS aliases"]

    PR13["PR#13: Python Pins<br/>Pin all deps"] --> PR14

    PR12 --> PR14
    PR14["PR#14: Prod Config<br/>.env.production"] --> PR15

    PR15["PR#15: Health Checks<br/>Add /health endpoints"] --> PR16

    PR16["PR#16: Logging<br/>Structured JSON logs"] --> PR17

    PR17["PR#17: Rate Limiting<br/>Add rate limiters"] --> PR18

    PR18["PR#18: Secrets<br/>AWS Secrets Manager"] --> PR19

    PR17 --> PR19
    PR19["PR#19: CI Optimization<br/>Caching + parallel"] --> PR20

    PR18 --> PR20
    PR20["PR#20: Migrations<br/>Alembic in CI"] --> PR21

    PR19 --> PR21
    PR21["PR#21: Sentry<br/>Error tracking"] --> PR22

    PR20 --> PR22
    PR22["PR#22: Runbook<br/>DEPLOYMENT.md"] --> PR23

    PR21 --> PR23
    PR23["PR#23: Arch Docs<br/>ARCHITECTURE.md"] --> PR24

    PR22 --> PR24
    PR24["PR#24: OpenAPI<br/>Schema + types"] --> PR25

    PR23 --> PR25
    PR25["PR#25: Integration Tests<br/>API contract tests"] --> PR26

    PR24 --> PR26
    PR26["PR#26: E2E Tests<br/>Playwright suite"]

    PR26 --> Complete["✅ PRODUCTION READY"]

    style PR1 fill:#f44336,color:#fff
    style PR2 fill:#f44336,color:#fff
    style PR3 fill:#f44336,color:#fff
    style PR4 fill:#f44336,color:#fff
    style Complete fill:#4CAF50,color:#fff
```

---

## 11. Node Version Propagation Problem

```mermaid
graph TD
    subgraph "Version Sources"
        nvmrc[".nvmrc<br/>20.13.0"]
        PackageEngines["package.json engines<br/>node: 20.13.0<br/>npm: 10.8.2"]
        CI["GitLab CI<br/>NODE_VERSION: 18 ❌"]
        README["README.md<br/>Node.js 18+ ❌"]
    end

    subgraph "Actual Versions"
        LocalDev["Local Developer<br/>Node 24.10.0 ❌<br/>npm 11.6.0 ❌"]
        CIRunner["CI Runner<br/>Node 18 ❌"]
        Production["Production<br/>Node ??? ❓"]
    end

    nvmrc -.->|"Should enforce"| LocalDev
    PackageEngines -.->|"Engine warning"| LocalDev
    CI -.->|"Uses"| CIRunner
    README -.->|"Developer reads"| LocalDev

    LocalDev -.->|"Push code"| CIRunner
    CIRunner -.->|"Deploy"| Production

    Conflict["⚠️ Version Drift<br/>Causes build failures"]

    LocalDev -.-> Conflict
    CIRunner -.-> Conflict

    style nvmrc fill:#4CAF50
    style PackageEngines fill:#4CAF50
    style CI fill:#f44336,color:#fff
    style README fill:#f44336,color:#fff
    style LocalDev fill:#f44336,color:#fff
    style CIRunner fill:#f44336,color:#fff
    style Production fill:#ff9800
    style Conflict fill:#f44336,color:#fff
```

---

## 12. Secrets Management (Current vs Fixed)

### Current (Insecure)

```mermaid
graph LR
    Dev["Developer"]

    subgraph "Git Repository ❌"
        EnvFile[".env<br/>Contains real API keys<br/>Committed 4 times"]
    end

    subgraph "Anyone with repo access"
        Attacker["Malicious Actor<br/>Can read keys"]
    end

    Dev -->|"git commit .env"| EnvFile
    EnvFile -.->|"Exposed"| Attacker
    Attacker -->|"Abuse keys"| Cost["$10k-$50k API charges"]

    style EnvFile fill:#f44336,color:#fff
    style Attacker fill:#f44336,color:#fff
    style Cost fill:#f44336,color:#fff
```

### Fixed (Secure)

```mermaid
graph LR
    Dev["Developer"]

    subgraph "Git Repository ✅"
        EnvExample[".env.example<br/>Placeholder values<br/>Safe to commit"]
        Gitignore[".gitignore<br/>Blocks .env files"]
    end

    subgraph "Secure Storage"
        SecretsManager["AWS Secrets Manager<br/>Encrypted keys<br/>Rotation enabled"]
    end

    subgraph "Application"
        App["App Code<br/>Reads from Secrets Manager"]
    end

    Dev -->|"git commit"| EnvExample
    Gitignore -.->|"Prevents"| EnvCommit["❌ Cannot commit .env"]
    Dev -->|"Creates"| LocalEnv[".env<br/>Local only<br/>Not committed"]
    LocalEnv -->|"Dev only"| App
    SecretsManager -->|"Production"| App

    style EnvExample fill:#4CAF50
    style Gitignore fill:#4CAF50
    style SecretsManager fill:#4CAF50
```

---

## Diagram Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Working correctly |
| ❌ | Broken / Incorrect |
| ⚠️ | Warning / Needs attention |
| ❓ | Unknown / Undefined |
| 🔒 | Security-related |
| 🔍 | Under investigation |
| -.-> | Weak/broken connection |
| --> | Strong/working connection |

---

**Total Diagrams**: 12
**Format**: Mermaid (GitHub/GitLab compatible)
**Rendering**: Copy diagrams into GitHub markdown or use Mermaid Live Editor

**View online**: https://mermaid.live (paste any diagram to render)
