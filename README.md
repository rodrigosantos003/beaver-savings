# Beaver Savings

**Save the Way a Beaver Bites Wood — Bit by Bit.**

Calculadora de poupança com base no salário. Permite estimar quanto podes poupar por mês com base no teu rendimento, descontos fiscais e despesas, e acompanhar o progresso ao longo do tempo.

---

## Visão geral

Beaver Savings ajuda utilizadores a planear poupança de forma incremental — mês a mês — com inputs realistas do mercado de trabalho português (salário base, subsídios, IRS, Segurança Social) e ferramentas para exportar resultados e gerar planos anuais.

---

## Inputs da calculadora

| Input                           | Descrição                                                          |
| ------------------------------- | ------------------------------------------------------------------ |
| **Método de poupança**          | Percentagem do rendimento líquido ou valor fixo mensal             |
| **Valor poupança**              | Calculado automaticamente ou definido manualmente pelo utilizador  |
| **Salário base**                | Remuneração mensal bruta                                           |
| **Subsídios**                   | Férias e Natal                                                     |
| **Valores extra**               | Rendimentos adicionais (bónus, horas extra, etc.)                  |
| **Toggle subsídios/extras**     | Incluir ou excluir subsídios e extras no cálculo                   |
| **Taxas IRS e SS**              | Imposto sobre o rendimento e contribuições para a Segurança Social |
| **Estimativa despesas mensais** | Despesas fixas e variáveis para calcular o disponível para poupar  |

---

## Funcionalidades

### Calculadora do mês

Calcula rendimento líquido, despesas, valor de poupança e saldo disponível com base nos inputs acima.

### Exportar resultados

- **PDF** — resumo exportável dos cálculos do mês
- **Email** — envio do resumo via email (integração Resend)

### Gerador de plano anual

Projeta poupança acumulada ao longo de 12 meses com base nos parâmetros definidos.

### Parser de recibos de vencimento

Upload de recibos de vencimento com extração automática de dados via **Gemini API**.

---

## Tech stack

| Camada                  | Tecnologia                |
| ----------------------- | ------------------------- |
| **Frontend**            | React + Next.js           |
| **API**                 | NestJS                    |
| **Base de dados**       | MongoDB                   |
| **Email**               | Resend                    |
| **AI (payslip parser)** | Google Gemini API (Flash) |

---

## Estrutura do repositório

```
savings-app/
│
├── apps/
│   │
│   ├── web/                              # Next.js frontend
│   │   ├── app/
│   │   │   ├── layout.tsx                # Root layout (fonts, dark mode, providers)
│   │   │   ├── page.tsx                  # Main calculator page
│   │   │   ├── globals.css
│   │   │   │
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── register/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── dashboard/
│   │   │       └── page.tsx              # Logged-in view: history, charts, goals
│   │   │
│   │   ├── components/
│   │   │   ├── calculator/
│   │   │   │   ├── SalaryInput.tsx
│   │   │   │   ├── SavingsMethodToggle.tsx
│   │   │   │   ├── ResultCard.tsx
│   │   │   │   └── GoalTracker.tsx
│   │   │   │
│   │   │   ├── charts/
│   │   │   │   ├── TrendChart.tsx
│   │   │   │   └── CumulativeChart.tsx
│   │   │   │
│   │   │   ├── history/
│   │   │   │   ├── MonthList.tsx
│   │   │   │   └── MonthRow.tsx
│   │   │   │
│   │   │   ├── email/
│   │   │   │   └── EmailResultsForm.tsx
│   │   │   │
│   │   │   ├── payslip/
│   │   │   │   └── PayslipUpload.tsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   │
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       └── DarkModeToggle.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                    # Fetch wrapper for calling the Nest API
│   │   │   ├── calculations.ts           # Pure functions: computeSavings(), etc.
│   │   │   ├── auth.ts                   # Token storage/refresh helpers
│   │   │   └── currency.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useEntries.ts             # Fetches/mutates entries via API
│   │   │   └── useDarkMode.ts
│   │   │
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.local                    # NEXT_PUBLIC_API_URL, etc.
│   │   └── package.json
│   │
│   └── api/                              # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   │
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── jwt.strategy.ts
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── dto/
│       │   │       ├── login.dto.ts
│       │   │       └── register.dto.ts
│       │   │
│       │   ├── users/
│       │   │   ├── users.module.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── users.service.ts
│       │   │   ├── schemas/
│       │   │   │   └── user.schema.ts
│       │   │   └── dto/
│       │   │       └── update-user.dto.ts
│       │   │
│       │   ├── entries/
│       │   │   ├── entries.module.ts
│       │   │   ├── entries.controller.ts
│       │   │   ├── entries.service.ts
│       │   │   ├── schemas/
│       │   │   │   └── entry.schema.ts
│       │   │   └── dto/
│       │   │       ├── create-entry.dto.ts
│       │   │       └── update-entry.dto.ts
│       │   │
│       │   ├── email/
│       │   │   ├── email.module.ts
│       │   │   ├── email.controller.ts
│       │   │   ├── email.service.ts      # Resend integration
│       │   │   └── templates/
│       │   │       └── results-summary.ts
│       │   │
│       │   ├── payslip/
│       │   │   ├── payslip.module.ts
│       │   │   ├── payslip.controller.ts
│       │   │   └── payslip.service.ts
│       │   │
│       │   ├── database/
│       │   │   └── database.module.ts    # MongooseModule.forRootAsync()
│       │   │
│       │   └── common/
│       │       ├── guards/
│       │       ├── decorators/
│       │       │   └── current-user.decorator.ts
│       │       ├── filters/
│       │       │   └── http-exception.filter.ts
│       │       └── interceptors/
│       │
│       ├── test/
│       │   ├── auth.e2e-spec.ts
│       │   └── entries.e2e-spec.ts
│       │
│       ├── .env                          # MONGODB_URI, JWT_SECRET, RESEND_API_KEY
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared-types/                     # Shared between web and api
│       ├── src/
│       │   ├── index.ts
│       │   ├── entry.ts                  # Entry, SavingsMethod types
│       │   └── user.ts                   # User, AuthPayload types
│       ├── tsconfig.json
│       └── package.json
└── README.md
```

---

## Estado atual

| App / Package           | Estado                 |
| ----------------------- | ---------------------- |
| `apps/web`              | Inicializado (Next.js) |
| `apps/api`              | Inicializado (NestJS)  |
| `packages/shared-types` | Por implementar        |

---

## Variáveis de ambiente

### `apps/web/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `apps/api/.env`

```
MONGODB_URI=
JWT_SECRET=
RESEND_API_KEY=
GEMINI_API_KEY=
```

---

## Licença

Ver [LICENSE](LICENSE).
