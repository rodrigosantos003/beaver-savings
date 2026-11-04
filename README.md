# Beaver Savings

**Save the Way a Beaver Bites Wood — Bit by Bit.**

Calculadora de poupança com base no salário. Permite estimar quanto podes poupar
por mês com base no teu rendimento, descontos fiscais e despesas, e acompanhar o
progresso ao longo do tempo.

---

## Visão geral

Beaver Savings ajuda utilizadores a planear poupança de forma incremental — mês
a mês — com inputs realistas do mercado de trabalho português (salário,
subsídios, etc) e ferramentas para exportar resultados e gerar
planos anuais.

---

## Inputs da calculadora

| Input                           | Descrição                                                          |
| ------------------------------- | ------------------------------------------------------------------ |
| **Método de poupança**          | Percentagem do rendimento líquido ou valor fixo mensal             |
| **Valor poupança**              | Calculado automaticamente ou definido manualmente pelo utilizador  |
| **Salário líquido**             | Remuneração mensal líquida                                         |
| **Subsídios**                   | Férias e Natal (incluir ou não no salário)                         |
| **Valores extra**               | Rendimentos adicionais (bónus, horas extra, etc.)                  |
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

---

## Tech stack

| Camada                  | Tecnologia                |
| ----------------------- | ------------------------- |
| **Frontend**            | React + Next.js           |
| **API**                 | NestJS                    |
| **Base de dados**       | MongoDB                   |
| **Email**               | Resend                    |

---

## Licença

Ver [LICENSE](LICENSE).
