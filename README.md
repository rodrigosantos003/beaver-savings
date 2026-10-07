# Beaver Savings

**Save the Way a Beaver Bites Wood — Bit by Bit.**

Calculadora de poupança com base no salário. Permite estimar quanto podes poupar
por mês com base no teu rendimento, descontos fiscais e despesas, e acompanhar o
progresso ao longo do tempo.

---

## Visão geral

Beaver Savings ajuda utilizadores a planear poupança de forma incremental — mês
a mês — com inputs realistas do mercado de trabalho português (salário base,
subsídios, IRS, Segurança Social) e ferramentas para exportar resultados e gerar
planos anuais.

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

Calcula rendimento líquido, despesas, valor de poupança e saldo disponível com
base nos inputs acima.

### Exportar resultados

- **PDF** — resumo exportável dos cálculos do mês
- **Email** — envio do resumo via email (integração Resend)

### Gerador de plano anual

Projeta poupança acumulada ao longo de 12 meses com base nos parâmetros
definidos.

### Parser de recibos de vencimento

Upload de recibos de vencimento com extração automática de dados via **Gemini
API**.

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

## Licença

Ver [LICENSE](LICENSE).
