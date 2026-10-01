![omnistack-agent](assets/banner.svg)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg) · ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) · ![Platforms](https://img.shields.io/badge/platforms-ChatGPT%20%C2%B7%20Claude%20%C2%B7%20Copilot%20%C2%B7%20Gemini%20%C2%B7%20Cursor%20%C2%B7%20Windsurf%20%C2%B7%20Generic-blue.svg)

**[🇺🇸 Read in English](README.md)**

## O que é

**omnistack-agent** é uma coleção open-source de instruções e referências de engenharia de software para assistentes de IA. Uma fonte única (`core/` + `knowledge/`) gera adaptadores para várias plataformas usando um script Node testado e sem dependências npm.

Um único assistente pode assumir doze papéis de engenharia. O projeto não executa um sistema independente de múltiplos agentes nem concede ferramentas, permissões ou acesso aos seus arquivos.

- **Arquiteto de Software** — fronteiras, trade-offs e decisões de arquitetura.
- **Desenvolvedor Full Stack** — funcionalidades entre UI, APIs e dados.
- **Desenvolvedor Mobile** — aplicativos nativos e multiplataforma.
- **Engenheiro Backend** — serviços, lógica de domínio e integridade dos dados.
- **Engenheiro Frontend** — interfaces acessíveis e estado previsível.
- **Administrador de Banco de Dados** — esquemas, índices, migrações e otimização.
- **Engenheiro DevOps** — CI/CD, infraestrutura, deploy e rollback.
- **Engenheiro de QA** — estratégia de testes, regressão e relatos de bugs.
- **Engenheiro de Segurança** — fronteiras de confiança, ameaças e padrões seguros.
- **Revisor de Código** — achados acionáveis com evidências de arquivo e linha.
- **Redator Técnico** — READMEs, referências de API e guias de arquitetura.
- **Mentor de Software** — explicações com exemplos executáveis.

As instruções incentivam mudanças proporcionais, evidências antes das conclusões, respeito às convenções do projeto e tratamento explícito de informações ou ferramentas indisponíveis. Orientação a objetos é uma opção; escolha abstrações que façam sentido para o problema.

## Como usar

Os adaptadores já estão gerados e versionados. Você não precisa de Node nem de build para usá-los. Revise as instruções e mescle com qualquer orientação existente no projeto antes de instalar.

| Plataforma | Adaptador | Instalação |
| --- | --- | --- |
| **ChatGPT** (Custom GPT, quando disponível) | [custom-gpt-instructions.md](adapters/chatgpt/custom-gpt-instructions.md) | Cole a versão enxuta em **Instructions**. Opcionalmente, envie [knowledge.md](adapters/reference/knowledge.md) como conhecimento de referência. |
| **Claude Code** (orientação do projeto) | [CLAUDE.md](adapters/claude/CLAUDE.md) | Mescle as instruções enxutas no `CLAUDE.md` do projeto. |
| **Claude Code** (subagente) | [agent.md](adapters/claude/agent.md) | Salve em `.claude/agents/`. A configuração de modelo herda o modelo da sessão. |
| **Claude Code** (skill) | [SKILL.md](adapters/claude/SKILL.md) | Salve como `.claude/skills/omnistack-agent/SKILL.md`; invoque `/omnistack-agent`. Esta versão inclui todo o conhecimento. |
| **GitHub Copilot** | [copilot-instructions.md](adapters/copilot/copilot-instructions.md) | Mescle em `.github/copilot-instructions.md`. |
| **Gemini** (Gem, quando disponível) | [gem-instructions.md](adapters/gemini/gem-instructions.md) | Cole em **Instructions**. Opcionalmente, adicione [knowledge.md](adapters/reference/knowledge.md) em **Knowledge**. |
| **Cursor** | [AGENTS.md](adapters/cursor/AGENTS.md) | Mescle no `AGENTS.md` da raiz do projeto. Esta versão inclui todo o conhecimento. |
| **Windsurf / Cascade** | [AGENTS.md](adapters/windsurf/AGENTS.md) | Mescle o adaptador enxuto dedicado no `AGENTS.md` da raiz do projeto. |
| **API / outros LLMs** | [system-prompt.md](adapters/generic/system-prompt.md) | Use a interface de instruções do seu provedor, respeitando os limites de contexto. Esta versão inclui todo o conhecimento. |

**Lean** contém as instruções centrais e um índice de módulos. O índice é um mapa, não o conteúdo dos módulos: as referências só podem ser usadas quando anexadas ou acessíveis no projeto. **Full** inclui o conhecimento completo no arquivo e consome mais contexto. O adaptador Custom GPT tem um orçamento do projeto de **8.000 caracteres**, não um limite universal da plataforma.

Veja [o guia de instalação](docs/platforms.md) para preservar arquivos existentes, configurar referências, entender a compatibilidade de `AGENTS.md` no Claude e usar as versões completas em APIs.

## Exemplos e avaliação

Os [exemplos](examples/README.md) incluem uma conta executável e [cenários de avaliação manual](examples/evaluation-cases.md) de depuração, funcionalidades, segurança, revisão, versões, arquitetura, ferramentas indisponíveis e limites monetários.

Os cenários são entradas de teste e evidências esperadas, não respostas de IA registradas nem resultados medidos de qualidade. Use [o guia de avaliação](docs/evaluation.md) para comparar prompts com o mesmo modelo e as mesmas ferramentas. As verificações automatizadas validam contratos do repositório e exemplos executáveis; não comprovam a qualidade das respostas dos modelos.

## Como contribuir

> Para alterar a saída gerada, edite `core/`, `knowledge/` ou os scripts de build. Nunca edite `adapters/` manualmente.

1. Altere a fonte. Registre novos módulos em `knowledge/_index.md`.
2. Gere os adaptadores com `npm run build`.
3. Execute `npm run check` para testar e validar.
4. Versione a fonte e a saída gerada juntas e abra um pull request.

`npm run check` **não** regenera adaptadores, para detectar divergência entre a saída versionada e a fonte. Os comandos de contribuição exigem Node **≥ 18**; não é necessário instalar dependências npm.

Veja [CONTRIBUTING.md](CONTRIBUTING.md) para o fluxo e [como adicionar conhecimento](docs/adding-knowledge.md) para o template dos módulos.

## Estrutura do repositório

```text
core/        # Identidade, papéis, fluxo, estilo e guardrails escritos na fonte
knowledge/   # Módulos de referência e índice escritos na fonte
adapters/    # Instruções e pacote de conhecimento gerados
scripts/     # Build, validação e testes sem dependências
examples/    # Exemplo executável e cenários de avaliação manual
docs/        # Guias de instalação, arquitetura, contribuição e avaliação
assets/      # Banner e mídia estática
```

## Próximas melhorias

O [plano de melhorias](docs/improvement-plan.md) acompanha esta rodada e candidatos para as próximas: TypeScript e mais módulos de domínio, pacotes de referência por plataforma e avaliações registradas com modelos. As mudanças devem seguir evidências de uso real.

## Licença

Distribuído sob a **Licença MIT**. Veja [LICENSE](LICENSE).
