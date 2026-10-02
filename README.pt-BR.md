![omnistack-agent](assets/banner.svg)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) · ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) · ![Platforms](https://img.shields.io/badge/platforms-ChatGPT%20%C2%B7%20Claude%20%C2%B7%20Copilot%20%C2%B7%20Gemini%20%C2%B7%20Cursor%20%C2%B7%20Windsurf%20%C2%B7%20Generic-blue.svg)

**[🇺🇸 Read in English](README.md)**

**omnistack-agent** ajuda um assistente de IA a depurar código, revisar mudanças, implementar funcionalidades e explicar decisões de engenharia com evidências. Oferece skills curtas por tarefa e referências de engenharia, geradas de uma fonte única sem dependências npm.

Um assistente pode usar doze papéis de engenharia. Ferramentas, permissões, seleção de modelo e delegação vêm da plataforma onde ele roda.

## Comece com uma tarefa

Use Node **≥ 18** para o instalador e as demonstrações executáveis. Os arquivos gerados já estão versionados; não é necessário fazer build nem `npm install`.

1. Clone o repositório e escolha sua plataforma.
2. Veja a prévia de instalação de uma skill em um **projeto existente** e depois instale.
3. Experimente um [prompt de demonstração](examples/showcase/README.md) em um ambiente descartável.
4. Execute as verificações e compare o resultado com o contrato documentado.

```bash
git clone https://github.com/Ricar66/omnistack-agent.git
cd omnistack-agent
node scripts/install.mjs install --platform claude --project "/caminho/do/seu-projeto" --skill omnistack-debug --dry-run
node scripts/install.mjs install --platform claude --project "/caminho/do/seu-projeto" --skill omnistack-debug
npm run demo
```

Troque o caminho por um diretório existente. Para `--platform`, escolha `claude`, `copilot`, `cursor` ou `codex`. No Claude Code, invoque `/omnistack-debug`; os outros hosts descobrem skills pelos próprios controles. Confira se a plataforma realmente carregou a skill.

| Skill | Quando usar |
| --- | --- |
| [omnistack-agent](packages/skills/omnistack-agent/SKILL.md) | Trabalho geral de engenharia entre os doze papéis |
| [omnistack-debug](packages/skills/omnistack-debug/SKILL.md) | Reproduzir um bug, isolar sua causa e verificar uma correção pequena |
| [omnistack-code-review](packages/skills/omnistack-code-review/SKILL.md) | Achados acionáveis com gravidade, arquivo/linha e impacto |
| [omnistack-security-review](packages/skills/omnistack-security-review/SKILL.md) | Fronteiras de confiança, caminhos reais de ataque e mitigações proporcionais |

Cada pacote inclui seus próprios arquivos de referência; os links do índice não dependem de outro clone. O instalador mostra os destinos, recusa conflitos e não altera instalações idênticas. Ele não substitui as orientações do seu projeto. Veja o [início rápido](docs/quickstart.md) e o [guia de instalação](docs/platforms.md), incluindo a remoção segura.

## Três demonstrações que você pode repetir

```text
cart: initial check failed as expected; solution checks passed
permissions: initial check failed as expected; solution checks passed
tasks: initial check failed as expected; solution checks passed
3 maintainer-authored demonstrations verified; no model responses evaluated.
```

Esta é a saída de `npm run demo`: um bug de total monetário, um bug de verificação de acesso e uma funcionalidade limitada de filtro de tarefas. Os [prompts, exemplos iniciais, soluções e verificações](examples/showcase/README.md) estão disponíveis para inspeção.

As soluções foram escritas pelo mantenedor. As verificações comprovam o comportamento das demonstrações, não medem a qualidade dos modelos. O [guia de avaliação](docs/evaluation.md) explica como salvar e comparar respostas reais com o mesmo modelo e as mesmas ferramentas.

[Duas tentativas reais de revisão no Codex](docs/evaluation-runs/2026-10-01/README.md) registram uma resposta observada e um bloqueio de leitura pela política da sessão; não são um benchmark comparativo.

## Outros adaptadores de plataforma

Os adaptadores Markdown existentes podem ser usados manualmente sem Node. Revise e mescle o conteúdo com as regras existentes do projeto.

| Plataforma | Adaptador | Uso |
| --- | --- | --- |
| ChatGPT Custom GPT | [custom-gpt-instructions.md](adapters/chatgpt/custom-gpt-instructions.md) | Cole em Instructions; opcionalmente anexe [knowledge.md](adapters/reference/knowledge.md) |
| Orientações do projeto no Claude Code | [CLAUDE.md](adapters/claude/CLAUDE.md) | Mescle no `CLAUDE.md` do projeto |
| Subagente Claude Code | [agent.md](adapters/claude/agent.md) | Salve em `.claude/agents/`; o modelo herda a sessão |
| Orientações do projeto no GitHub Copilot | [copilot-instructions.md](adapters/copilot/copilot-instructions.md) | Mescle em `.github/copilot-instructions.md` |
| Gemini Gem | [gem-instructions.md](adapters/gemini/gem-instructions.md) | Cole em Instructions; opcionalmente anexe o pacote de referências |
| Orientações do projeto no Cursor | [AGENTS.md](adapters/cursor/AGENTS.md) | Mescle no `AGENTS.md` da raiz; conhecimento completo |
| Windsurf / Cascade | [AGENTS.md](adapters/windsurf/AGENTS.md) | Mescle no `AGENTS.md` da raiz; enxuto |
| API / outros LLMs | [system-prompt.md](adapters/generic/system-prompt.md) | Use a interface de instruções e os limites de contexto do provedor |

Adaptadores **lean** contêm as instruções centrais e um mapa de módulos. Precisam de referências acessíveis ou anexadas. Adaptadores **full** incluem todo o conhecimento e consomem mais contexto. A [skill Claude em arquivo único](adapters/claude/SKILL.md) continua disponível; os pacotes modulares acima carregam arquivos de apoio conforme a tarefa. O adaptador Custom GPT tem um **orçamento do projeto de 8.000 caracteres**, não um limite universal de plataforma.

## Cobertura de engenharia

As referências cobrem arquitetura, OOP, JavaScript, TypeScript, C#, SQL, frontend, backend, mobile, bancos de dados, DevOps, testes, segurança e documentação. As instruções incentivam mudanças proporcionais, respeito às convenções, limites claros de capacidade e verificações observadas antes de declarar conclusão. Escolha abstrações adequadas à tarefa.

Os doze papéis são Arquiteto, Desenvolvedor Full Stack, Desenvolvedor Mobile, Engenheiro Backend, Engenheiro Frontend, Administrador de Banco de Dados, Engenheiro DevOps, Engenheiro de QA, Engenheiro de Segurança, Revisor de Código, Redator Técnico e Mentor de Software.

## Contribua

> Edite `core/`, `workflows/`, `knowledge/` ou scripts. Nunca edite `adapters/` ou `packages/` manualmente.

```bash
npm run build
npm run check
npm run demo
```

`npm run check` testa e valida a saída versionada sem regenerá-la, para detectar divergências. Veja [CONTRIBUTING.md](CONTRIBUTING.md), [como adicionar conhecimento](docs/adding-knowledge.md) e o [plano de melhorias](docs/improvement-plan.md).

```text
core/        # Instruções de engenharia compartilhadas
workflows/   # Fontes das skills focadas em tarefas
knowledge/   # Módulos de referência e índice canônico
adapters/    # Instruções de plataforma legadas e geradas
packages/    # Skills modulares, referências e manifesto gerados
scripts/     # Build, validação, instalador, demonstrações e testes
examples/    # Exemplos executáveis e cenários de avaliação
docs/        # Início rápido, instalação, arquitetura e avaliação
```

Distribuído sob a **Licença MIT**. Veja [LICENSE](LICENSE).