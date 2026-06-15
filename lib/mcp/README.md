# MCP do BP Amplify

Um servidor [MCP](https://modelcontextprotocol.io) que expõe o motor do **BP vivo**
(planilha v8, `lib/calc.ts`) como ferramentas. Assim cada sócio pode conversar com
a IA dele (Claude, etc.) e **propor e simular** mudanças no plano — recebendo os
números reais do modelo, não estimativas inventadas.

O endpoint é servido pelo próprio deploy do site (Vercel):

```
https://SEU-DEPLOY.vercel.app/api/mcp
```

## Como o sócio conecta

É uma URL de **MCP remoto (Streamable HTTP)**. Onde colar:

- **Claude (web/desktop)** → Configurações → Connectors → *Add custom connector* →
  cole a URL acima. Se houver token, informe-o como header
  `Authorization: Bearer <token>`.
- **Claude Code / outros clientes** → registre um servidor MCP remoto apontando
  para a mesma URL.

Depois é só pedir em linguagem natural, por exemplo:

> "Liste as alavancas do BP."
> "E se a gente fechar 8 contratos mid/mês em vez de 3? Como fica o EBITDA?"
> "Compara dobrar bootcamps vs. acelerar a rede de Amplifiers."
> "Salva essa proposta como 'Foco em comunidade' pra eu mostrar aos fundadores."

## Ferramentas

| Ferramenta          | O que faz |
| ------------------- | --------- |
| `listar_premissas`  | Lista as alavancas: rótulo, grupo, unidade, faixa min/max e o valor em cada cenário base. |
| `rodar_cenario`     | Roda pessimista / realista / otimista: receita, EBITDA e margem por ano, break-even e custos por categoria. |
| `simular`           | Parte de um cenário base e aplica overrides nas alavancas; devolve o resultado e o **delta** vs. a base. |
| `comparar`          | Coloca várias variantes lado a lado. |
| `salvar_proposta`   | Salva uma proposta nomeada (base + overrides + nota) para os fundadores revisarem. |
| `listar_propostas`  | Lista as propostas salvas. |
| `ver_proposta`      | Abre uma proposta por id e recalcula o resultado atual. |

Valores fora da faixa de um slider são **fixados no limite** e reportados em `avisos`.

## Configuração (variáveis de ambiente)

| Variável            | Efeito |
| ------------------- | ------ |
| `MCP_TOKEN`         | Se definida, exige `Authorization: Bearer <MCP_TOKEN>`. **Sem ela o endpoint fica aberto** — defina em produção. |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Liga a persistência via **Vercel KV** (Upstash Redis). Sem elas, as propostas ficam só em memória (efêmeras: somem quando o lambda recicla). |

Para persistir propostas: no painel da Vercel, *Storage → criar um KV* e conectá-lo
ao projeto — as duas variáveis são injetadas automaticamente. Nenhuma mudança de
código é necessária.

## Arquitetura

- `lib/mcp/schema.ts` — metadados das alavancas (deriva de `app/bp/sliders.ts`) e validação de overrides.
- `lib/mcp/summary.ts` — resume um `ModelResult` em JSON enxuto (anos, break-even, custos por categoria).
- `lib/mcp/store.ts` — persistência das propostas (Vercel KV ou memória).
- `lib/mcp/server.ts` — definição das ferramentas + dispatch JSON-RPC (independente de transporte).
- `app/api/mcp/route.ts` — endpoint HTTP (auth + CORS); só casca de transporte.

Testes em `lib/mcp/server.test.ts` (`npm test`).
