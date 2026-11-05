# Beaver Savings

**Save the Way a Beaver Bites Wood — Bit by Bit.**

> 🇵🇹 [Português](#português) · 🇬🇧 [English](#english)

## Índice / Table of Contents

**Português**

1. [Visão geral](#visão-geral)
2. [Inputs da calculadora](#inputs-da-calculadora)
3. [Funcionalidades](#funcionalidades)
   - [Calculadora do mês](#calculadora-do-mês)
   - [Exportar resultados](#exportar-resultados)
   - [Gerador de plano anual](#gerador-de-plano-anual)
4. [Stack tecnológica](#stack-tecnológica)
5. [DevOps e infraestrutura](#devops-e-infraestrutura)
   - [Arquitetura](#arquitetura)
   - [Deploys](#deploys)
   - [Infraestrutura como código (IaC)](#infraestrutura-como-código-iac)
   - [Notas sobre o MongoDB Atlas](#notas-sobre-o-mongodb-atlas)
   - [Pipelines CI/CD](#pipelines-cicd)
6. [Licença](#licença)

**English**

1. [Overview](#overview)
2. [Calculator inputs](#calculator-inputs)
3. [Features](#features)
   - [Monthly calculator](#monthly-calculator)
   - [Export results](#export-results)
   - [Annual plan generator](#annual-plan-generator)
4. [Tech stack](#tech-stack)
5. [DevOps and infrastructure](#devops-and-infrastructure)
   - [Architecture](#architecture)
   - [Deployments](#deployments)
   - [Infrastructure as Code (IaC)](#infrastructure-as-code-iac)
   - [MongoDB Atlas notes](#mongodb-atlas-notes)
   - [CI/CD workflows](#cicd-workflows)
6. [License](#license)

---

# Português

Calculadora de poupança com base no salário. Permite estimar quanto podes poupar
por mês com base no teu rendimento, descontos fiscais e despesas, e acompanhar o
progresso ao longo do tempo.

## Visão geral

O Beaver Savings ajuda os utilizadores a planear a poupança de forma incremental
— mês a mês — com inputs realistas do mercado de trabalho português (salário,
subsídios, etc.) e ferramentas para exportar resultados e gerar planos anuais.

## Inputs da calculadora

| Input                           | Descrição                                                         |
| ------------------------------- | ----------------------------------------------------------------- |
| **Método de poupança**          | Percentagem do rendimento líquido ou valor fixo mensal            |
| **Valor poupança**              | Calculado automaticamente ou definido manualmente pelo utilizador |
| **Salário líquido**             | Remuneração mensal líquida                                        |
| **Subsídios**                   | Férias e Natal (incluir ou não no salário)                        |
| **Valores extra**               | Rendimentos adicionais (bónus, horas extra, etc.)                 |
| **Estimativa despesas mensais** | Despesas fixas e variáveis para calcular o disponível para poupar |

## Funcionalidades

### Calculadora do mês

Calcula o rendimento líquido, as despesas, o valor de poupança e o saldo
disponível com base nos inputs acima.

### Exportar resultados

- **PDF** — resumo exportável dos cálculos do mês
- **Email** — envio do resumo por email (integração com a Resend)

### Gerador de plano anual

Projeta a poupança acumulada ao longo de 12 meses com base nos parâmetros
definidos.

## Stack tecnológica

| Camada                   | Tecnologia      |
| ------------------------ | --------------- |
| **Frontend**             | React + Next.js |
| **API**                  | NestJS          |
| **Base de dados**        | MongoDB (Atlas) |
| **Email**                | Resend          |
| **Hosting**              | Vercel          |
| **Infraestrutura (IaC)** | Terraform       |

## DevOps e infraestrutura

### Arquitetura

O projeto é um monorepo (`apps/web` e `apps/api`) e a infraestrutura é gerida
com Terraform, em `infrastructure/terraform`.

| Recurso                                        | Provider      | Descrição                               |
| ---------------------------------------------- | ------------- | --------------------------------------- |
| `vercel_project.web`                           | Vercel        | Frontend Next.js (`beaver-savings`)     |
| `vercel_project.api`                           | Vercel        | API NestJS (`beaver-savings-api`)       |
| `mongodbatlas_advanced_cluster.beaver_savings` | MongoDB Atlas | Cluster `Cluster0` (M0, free tier, AWS) |

### Deploys

Os dois projetos Vercel estão ligados ao repositório GitHub
(`rodrigosantos003/beaver-savings`):

- **Produção** — cada push para a branch `main` dispara um deploy.
- **Preview** — as restantes branches e pull requests geram deploys de preview
  (comportamento por omissão da Vercel).

### Infraestrutura como código (IaC)

**Requisitos**

- Terraform `>= 1.5.0`
- Providers: `vercel/vercel ~> 5.0` e `mongodb/mongodbatlas ~> 2.2`

**Credenciais**

Os providers lêem as credenciais de variáveis de ambiente:

| Variável                    | Provider      |
| --------------------------- | ------------- |
| `VERCEL_API_TOKEN`          | Vercel        |
| `MONGODB_ATLAS_PUBLIC_KEY`  | MongoDB Atlas |
| `MONGODB_ATLAS_PRIVATE_KEY` | MongoDB Atlas |

**Comandos**

```bash
cd infrastructure/terraform

terraform init     # instalar providers
terraform plan     # pré-visualizar alterações
terraform apply    # aplicar alterações
```

### Notas sobre o MongoDB Atlas

- O cluster corre no **free tier (M0)**. No Terraform, o M0 é representado com
  `provider_name = "TENANT"` e `backing_provider_name = "AWS"`.
- Para migrar para um cluster pago, é preciso mudar `provider_name` para
  `"AWS"`, remover `backing_provider_name` e definir um `instance_size` real
  (ex.: `M10`). Isto desencadeia um upgrade com custos associados, por isso deve
  ser feito de forma deliberada.
- Recomenda-se `lifecycle { prevent_destroy = true }` neste recurso para evitar
  a remoção acidental dos dados.

### Pipelines CI/CD

O repositório tem três workflows no GitHub Actions. Todos correm com permissões
de leitura por defeito, e os de CI e Security cancelam execuções anteriores do
mesmo ref (`concurrency`).

| Workflow                      | Quando corre                                                        | O que faz                                                                                           |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Beaver Savings - CI**       | Push e PR para `main`                                               | Instala dependências, compila `savings-core`, faz lint (web e API), testa a API e compila web e API |
| **Beaver Savings - Security** | Push e PR para `main`, e todas as segundas às 07:00 UTC             | Auditoria de dependências (`yarn audit --level high`) e deteção de segredos com Gitleaks            |
| **Terraform - Validation**    | Push e PR que alterem `infrastructure/terraform/**`, ou manualmente | Verifica `terraform fmt`, `terraform init -backend=false` e `terraform validate`                    |

**Notas**

- Os jobs de CI e Security são ignorados em PRs do Dependabot.
- O workflow de Terraform apenas valida a configuração. **Não executa `plan` nem
  `apply`**, por isso as alterações à infraestrutura são aplicadas manualmente
  (ver [Infraestrutura como código (IaC)](#infraestrutura-como-código-iac)).
- O deploy da aplicação não passa pelo GitHub Actions: é feito pela integração
  Git da Vercel (ver [Deploys](#deploys)).

**Correr as verificações localmente**

```bash
yarn install --frozen-lockfile
yarn build:core
yarn lint:web && yarn lint:api
yarn workspace api test --runInBand
yarn build:web && yarn build:api

cd infrastructure/terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

## Licença

Ver [LICENSE](LICENSE).

[⬆ Voltar ao índice](#índice--table-of-contents)

---

# English

A salary-based savings calculator. It lets you estimate how much you can save
each month based on your income, tax deductions and expenses, and track your
progress over time.

## Overview

Beaver Savings helps users plan their savings incrementally — month by month —
using realistic inputs from the Portuguese job market (salary, holiday and
Christmas subsidies, etc.) along with tools to export results and generate
annual plans.

## Calculator inputs

| Input                        | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| **Savings method**           | Percentage of net income or a fixed monthly amount               |
| **Savings amount**           | Calculated automatically or set manually by the user             |
| **Net salary**               | Monthly net pay                                                  |
| **Subsidies**                | Holiday and Christmas (whether or not to include in salary)      |
| **Extra income**             | Additional income (bonuses, overtime, etc.)                      |
| **Monthly expense estimate** | Fixed and variable expenses used to work out what's left to save |

## Features

### Monthly calculator

Calculates net income, expenses, savings amount and available balance based on
the inputs above.

### Export results

- **PDF** — exportable summary of the month's calculations
- **Email** — send the summary by email (Resend integration)

### Annual plan generator

Projects accumulated savings over 12 months based on the chosen parameters.

## Tech stack

| Layer                    | Technology      |
| ------------------------ | --------------- |
| **Frontend**             | React + Next.js |
| **API**                  | NestJS          |
| **Database**             | MongoDB (Atlas) |
| **Email**                | Resend          |
| **Hosting**              | Vercel          |
| **Infrastructure (IaC)** | Terraform       |

## DevOps and infrastructure

### Architecture

The project is a monorepo (`apps/web` and `apps/api`) and the infrastructure is
managed with Terraform, in `infrastructure/terraform`.

| Resource                                       | Provider      | Description                             |
| ---------------------------------------------- | ------------- | --------------------------------------- |
| `vercel_project.web`                           | Vercel        | Next.js frontend (`beaver-savings`)     |
| `vercel_project.api`                           | Vercel        | NestJS API (`beaver-savings-api`)       |
| `mongodbatlas_advanced_cluster.beaver_savings` | MongoDB Atlas | `Cluster0` cluster (M0, free tier, AWS) |

### Deployments

Both Vercel projects are connected to the GitHub repository
(`rodrigosantos003/beaver-savings`):

- **Production** — every push to the `main` branch triggers a deployment.
- **Preview** — all other branches and pull requests generate preview
  deployments (Vercel's default behavior).

### Infrastructure as Code (IaC)

**Requirements**

- Terraform `>= 1.5.0`
- Providers: `vercel/vercel ~> 5.0` and `mongodb/mongodbatlas ~> 2.2`

**Credentials**

The providers read their credentials from environment variables:

| Variable                    | Provider      |
| --------------------------- | ------------- |
| `VERCEL_API_TOKEN`          | Vercel        |
| `MONGODB_ATLAS_PUBLIC_KEY`  | MongoDB Atlas |
| `MONGODB_ATLAS_PRIVATE_KEY` | MongoDB Atlas |

**Commands**

```bash
cd infrastructure/terraform

terraform init     # install providers
terraform plan     # preview changes
terraform apply    # apply changes
```

### MongoDB Atlas notes

- The cluster runs on the **free tier (M0)**. In Terraform, M0 is represented
  with `provider_name = "TENANT"` and `backing_provider_name = "AWS"`.
- To move to a paid cluster, change `provider_name` to `"AWS"`, remove
  `backing_provider_name` and set a real `instance_size` (e.g. `M10`). This
  triggers an upgrade with associated costs, so it should be done deliberately.
- Using `lifecycle { prevent_destroy = true }` on this resource is recommended
  to avoid accidentally deleting the data.

### CI/CD workflows

The repository has three GitHub Actions workflows. All of them run with
read-only permissions by default, and the CI and Security workflows cancel
previous runs for the same ref (`concurrency`).

| Workflow                      | When it runs                                                    | What it does                                                                                            |
| ----------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Beaver Savings - CI**       | Push and PR to `main`                                           | Installs dependencies, builds `savings-core`, lints (web and API), tests the API and builds web and API |
| **Beaver Savings - Security** | Push and PR to `main`, and every Monday at 07:00 UTC            | Dependency audit (`yarn audit --level high`) and secret detection with Gitleaks                         |
| **Terraform - Validation**    | Push and PR changing `infrastructure/terraform/**`, or manually | Checks `terraform fmt`, `terraform init -backend=false` and `terraform validate`                        |

**Notes**

- CI and Security jobs are skipped on Dependabot PRs.
- The Terraform workflow only validates the configuration. **It does not run
  `plan` or `apply`**, so infrastructure changes are applied manually (see
  [Infrastructure as Code (IaC)](#infrastructure-as-code-iac)).
- Application deployment does not go through GitHub Actions: it is handled by
  Vercel's Git integration (see [Deployments](#deployments)).

**Running the checks locally**

```bash
yarn install --frozen-lockfile
yarn build:core
yarn lint:web && yarn lint:api
yarn workspace api test --runInBand
yarn build:web && yarn build:api

cd infrastructure/terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

## License

See [LICENSE](LICENSE).

[⬆ Back to top](#índice--table-of-contents)
