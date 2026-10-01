# Contributing to omnistack-agent

## English

### Prerequisites

Use Node.js **≥ 18**. The build and tests use Node's built-in modules; there are no npm dependencies to install. The English and Portuguese READMEs are maintained together; the detailed guides are in English.

### Choose the source for your change

| Change | Edit |
| --- | --- |
| Identity, roles, workflow, interaction, or guardrails | `core/` |
| Engineering reference content | `knowledge/` and its index |
| Adapter formats, budgets, or output paths | `scripts/` |
| Installation, examples, or evaluation guidance | `docs/`, `examples/`, or READMEs |

**Never edit `adapters/` by hand.** They are generated, and validation rejects differences from the expected output. Preserve platform-specific compatibility when changing the generator.

### Workflow

1. Fork the repository and create a descriptive branch.
2. Edit the authored source. Register every new knowledge module in `knowledge/_index.md`.
3. Run `npm run build` to regenerate output.
4. Run `npm run check`.
5. Inspect the diff, including generated changes. Commit source and generated output together.
6. Open a pull request against `main`, explaining the problem, resulting behavior, and checks performed.

```bash
npm run build
npm run check
```

`npm run check` runs tests and validation **without rebuilding**. This is deliberate: CI must detect stale committed adapters rather than silently repairing them. Run `npm test` or `npm run validate` individually when investigating a failure.

CI runs these checks on Linux and Windows with Node 18 and 22. A green check establishes the tested source/build contracts and executable example behavior. For claims about model response quality, follow [the manual evaluation guide](docs/evaluation.md) and retain the results.

### Knowledge modules

Use [the module guide](docs/adding-knowledge.md) for the required headings and difficulty marker. Prefer official references, identify version-sensitive guidance, and provide examples that handle their stated boundaries. Check that index links resolve and every module is registered.

### Prompt and adapter changes

Aim for a concise core, with 5,800 characters as an editorial target rather than an enforced source ceiling. Keep rendered output within the target's configured budget. The Custom GPT target has an **8,000-character project budget**, counted as Unicode code points in the rendered file, including its generated header. The generator enforces this rendered target budget. This is not a universal platform limit.

Lean indexes point to modules; they do not embed or fetch those modules. Update [the installation guide](docs/platforms.md) whenever packaging or installation changes. Do not claim new platform support solely because another product accepts Markdown.

When adding a target, define its name, output path, mode, optional frontmatter, and any size budget in `scripts/lib.mjs`. Cover its contract in tests and document how a user installs it safely.

### Commit and pull request style

Use `<type>(<optional scope>): <short description>`, for example:

- `docs(knowledge): explain safe integer money boundaries`
- `feat(core): add evidence-based review guidance`
- `fix(adapters): preserve the Claude model selection`
- `build(scripts): validate knowledge index coverage`

State which checks actually ran. Label illustrative prompts as scenarios; do not present expected answers as observed model output. Avoid unrelated changes, and keep both READMEs consistent.

## Português (PT-BR)

### Pré-requisitos

Use Node.js **≥ 18**. Build e testes usam módulos nativos do Node; não há dependências npm para instalar. Os READMEs em inglês e português são mantidos juntos; os guias detalhados estão em inglês.

### Onde alterar

| Mudança | Fonte |
| --- | --- |
| Identidade, papéis, fluxo, interação ou guardrails | `core/` |
| Referências de engenharia | `knowledge/` e seu índice |
| Formatos, orçamentos ou caminhos dos adaptadores | `scripts/` |
| Instalação, exemplos ou avaliação | `docs/`, `examples/` ou READMEs |

**Nunca edite `adapters/` manualmente.** Os arquivos são gerados e a validação rejeita divergências. Preserve a compatibilidade de cada plataforma ao alterar o gerador.

### Fluxo

1. Faça um fork e crie uma branch descritiva.
2. Edite a fonte. Registre cada novo módulo em `knowledge/_index.md`.
3. Execute `npm run build` para gerar a saída.
4. Execute `npm run check`.
5. Revise o diff, incluindo os adaptadores. Versione fonte e saída gerada juntas.
6. Abra um pull request para `main`, explicando o problema, o comportamento resultante e as verificações realizadas.

```bash
npm run build
npm run check
```

`npm run check` executa testes e validação **sem regenerar** os adaptadores. Assim, a CI detecta arquivos versionados desatualizados. Para investigar falhas, execute `npm test` ou `npm run validate` separadamente.

A CI executa as verificações em Linux e Windows com Node 18 e 22. Um resultado verde comprova os contratos e os exemplos executáveis cobertos pelos testes. Para avaliar respostas dos modelos, siga [o guia de avaliação manual](docs/evaluation.md) e guarde os resultados.

### Módulos e adaptadores

O [guia de módulos](docs/adding-knowledge.md) define os títulos obrigatórios e o marcador de dificuldade. Prefira fontes oficiais, indique orientações que dependem de versão e trate os limites dos exemplos. Todo módulo deve estar registrado no índice com um link válido.

O alvo Custom GPT tem um **orçamento do projeto de 8.000 caracteres**, contado em pontos de código Unicode no arquivo final, incluindo o cabeçalho gerado. O gerador aplica esse orçamento ao arquivo final. A meta de 5.800 caracteres para o core é editorial, sem um teto separado aplicado pelo gerador. Isso não é um limite universal da plataforma. Os índices lean apontam para módulos; não incluem nem buscam o conteúdo desses módulos.

Ao alterar formato, pacote ou instalação, atualize [o guia de plataformas](docs/platforms.md). Mantenha os dois READMEs consistentes e informe quais verificações executou. Use mensagens no formato `<tipo>(<escopo opcional>): <descrição curta>`. Prompts ilustrativos são cenários de avaliação, não respostas observadas de um modelo.
