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
beaver-savings/
│
├── apps/
│   │
│   ├── web/                              # Next.js frontend (next-intl, Tailwind 4)
│   │   ├── app/
│   │   │   ├── [locale]/                 # Rotas com prefixo de locale (pt, en)
│   │   │   │   ├── layout.tsx            # Layout raiz por locale
│   │   │   │   ├── page.tsx              # Redireciona para /landing
│   │   │   │   ├── landing/
│   │   │   │   │   └── page.tsx          # Landing page de marketing
│   │   │   │   └── calculator/
│   │   │   │       └── page.tsx          # Calculadora de poupança
│   │   │   ├── favicon.ico
│   │   │   └── globals.css
│   │   │
│   │   ├── components/
│   │   │   ├── BeaverLogo.tsx
│   │   │   ├── RiverWaveBackground.tsx
│   │   │   └── calculator/               # Formulário, resultados e exportação
│   │   │
│   │   ├── i18n/
│   │   │   ├── navigation.ts             # Link, redirect e router com locale
│   │   │   ├── request.ts                # Configuração next-intl por pedido
│   │   │   └── routing.ts                # Locales suportados e routing
│   │   │
│   │   ├── languages/
│   │   │   ├── en.json
│   │   │   └── pt.json
│   │   │
│   │   ├── lib/
│   │   │   └── palette.ts                # Tokens de cor da marca
│   │   │
│   │   ├── public/                       # Assets estáticos (SVGs)
│   │   ├── middleware.ts                 # Deteção de locale (next-intl)
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── eslint.config.mjs
│   │   ├── tsconfig.json
│   │   ├── AGENTS.md
│   │   └── package.json
│   │
│   └── api/                              # NestJS backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── modules/app.module.ts
│       │   ├── controllers/app.controller.ts
│       │   ├── services/app.service.ts
│       │   └── savings/                  # POST /savings/email (Resend)
│       │
│       ├── test/
│       │   ├── app.e2e-spec.ts
│       │   └── jest-e2e.json
│       │
│       ├── nest-cli.json
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       ├── eslint.config.mjs
│       ├── .prettierrc
│       └── package.json
│
├── packages/
│   ├── savings-core/                     # Fórmula do mês e do plano anual
│   └── shared-types/                     # Tipos partilhados (por implementar)
│
├── package.json                          # Workspaces Yarn e scripts raiz
├── LICENSE
└── README.md
```

---

## Estado atual

| App / Package           | Estado                 |
| ----------------------- | ---------------------- |
| `apps/web`              | Landing e calculadora  |
| `apps/api`              | Saúde e envio de email |
| `packages/savings-core` | Cálculo partilhado     |
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
RESEND_FROM=
WEB_ORIGIN=http://localhost:3000
GEMINI_API_KEY=
```

---

## Licença

Ver [LICENSE](LICENSE).
