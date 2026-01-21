---
title: 'Canvas CLI: O Guia Completo para Automação de LMS'
description: 'Domine a automação do Canvas LMS com Canvas CLI. Aprenda instalação, OAuth, operações em lote e fluxos de trabalho avançados.'
pubDate: 2025-01-20
author: 'Juan Felipe Rivera González'
tags: ['go', 'canvas-lms', 'cli', 'automation', 'ai-agents']
cover: '@assets/blog/covers/canvas-cli-guide-cover.png'
coverAlt: 'Interface de terminal mostrando comandos do Canvas CLI com saída colorida, elementos de design inspirados em Go e nós conectados representando automação de API'
lang: 'pt'
translationKey: 'canvas-cli-guide'
draft: false
featured: true
---

Gerenciar o Canvas LMS em escala é tedioso e propenso a erros. Administradores clicando em interfaces web, desenvolvedores escrevendo requisições HTTP repetitivas, instrutores avaliando centenas de entregas manualmente - essas tarefas repetitivas drenam produtividade e introduzem erros humanos.

Com agentes de IA executando tarefas a partir do terminal, construí **Canvas CLI** - uma ferramenta para me ajudar e aos meus agentes de IA no trabalho diário com o Canvas LMS. Construído com Claude Code usando a técnica do loop Ralph Wiggum, foi projetado tanto para operadores humanos quanto para agentes de IA.

Neste guia completo, vou guiá-lo desde a instalação até fluxos de trabalho de automação avançados que podem economizar horas de trabalho manual.

## Por Que Usar Canvas CLI para Automação de LMS?

### O Desafio da Automação

O Canvas LMS é rico em recursos, mas automatizá-lo tradicionalmente requer:

1. **Scripts personalizados** - Escrever requisições HTTP, lidar com paginação, gerenciar tokens
2. **Ferramentas de terceiros** - Frequentemente limitadas em escopo ou exigindo licenças pagas
3. **Trabalho manual** - A interface web para tudo (não escalável)

### Pronto para Agentes de IA: Automação Segura Sem Exposição de Tokens

Um dos aspectos mais poderosos do Canvas CLI é sua compatibilidade com agentes de IA. Assistentes de IA como o Claude podem executar operações do Canvas simplesmente sabendo como usar os comandos do CLI - **sem necessidade de expor tokens de API diretamente ao LLM**.

O agente herda as permissões do token autenticado armazenado de forma segura no keyring do seu sistema, o que significa:

- **Sem exposição de tokens** - As credenciais de API nunca passam pelo contexto do modelo de IA
- **Permissões herdadas** - O agente opera dentro do seu escopo de acesso existente
- **Trilha de auditoria** - Todas as operações são executadas através do CLI com logging padrão
- **Automação segura** - A IA pode ajudar a automatizar fluxos de trabalho complexos sem riscos de segurança
- **Acesso delimitado** - As permissões do token limitam o que a IA pode fazer, mesmo se solicitado de outra forma

Isso é fundamentalmente diferente de dar a um agente de IA tokens de API brutos, onde as credenciais poderiam potencialmente ser registradas, vazadas ou mal utilizadas. Com o Canvas CLI, a IA apenas conhece os comandos - a autenticação é tratada pelo keyring seguro do seu sistema.

### Recursos Principais

- **Binário único multiplataforma** (Linux, macOS, Windows, ARM64)
- **OAuth 2.0 + PKCE seguro** com armazenamento no keyring do sistema
- **Operações em massa via CSV** (avaliações, matrículas)
- **Shell interativo** com autocompletar com Tab
- **Completações de shell** (bash, zsh, fish, PowerShell)
- **Gerenciamento multi-instância** para dev/staging/produção
- **Listener de webhooks** com verificação JWT
- **Diagnósticos integrados** (`canvas doctor`)
- **Rate limiting adaptativo** e cache de respostas
- **Saída flexível** como tabela, JSON, YAML ou CSV
- **Suporte a masquerading de admin**

### Práticas de Desenvolvimento

- 90% de cobertura de testes
- Matriz CI: 3 SO × 2 versões de Go
- Varredura de segurança (govulncheck, gosec)
- 11 linters via golangci-lint
- Hooks de pre-commit
- Releases e documentação automatizados
- Commits convencionais
- GitHub Action do Claude Code para assistência em PRs

Código aberto. Escrito em Go.

## Pré-requisitos

Antes de instalar o Canvas CLI, certifique-se de ter:

### Requisitos do Sistema

- **Sistema Operacional**: Linux, macOS ou Windows (amd64 ou arm64)
- **Keyring do Sistema**: Disponível para armazenamento seguro de tokens
  - macOS: Keychain (integrado)
  - Windows: Credential Manager (integrado)
  - Linux: Secret Service (gnome-keyring ou kwallet)

### Ferramentas Necessárias

- **jq** - Processador JSON para analisar a saída do CLI em scripts

  ```bash
  # macOS
  brew install jq

  # Ubuntu/Debian
  sudo apt install jq

  # Windows (chocolatey)
  choco install jq
  ```

### Acesso ao Canvas LMS

- URL da sua instância Canvas (ex., `https://sua-escola.instructure.com`)
- **Para OAuth 2.0**: Acesso de administrador para criar Developer Keys
- **Para tokens API**: Configurações → Integrações Aprovadas → Novo Token de Acesso

## Instalando Canvas CLI

### Homebrew (macOS e Linux)

O método de instalação mais fácil usa o Homebrew:

```bash
# Adicionar o tap
brew tap jjuanrivvera/canvas-cli

# Instalar
brew install canvas-cli

# Verificar instalação
canvas --version
```

### Go Install

Se você tem Go 1.21+ instalado:

```bash
go install github.com/jjuanrivvera/canvas-cli/cmd/canvas@latest
```

### Download Direto

Baixe binários pré-compilados do [GitHub Releases](https://github.com/jjuanrivvera/canvas-cli/releases):

- Linux (amd64, arm64)
- macOS (amd64, arm64)
- Windows (amd64, arm64)

## Configuração de Autenticação do Canvas CLI

O Canvas CLI suporta dois métodos de autenticação: OAuth 2.0 (recomendado) e tokens API.

### OAuth 2.0 com PKCE (Recomendado)

OAuth 2.0 é mais seguro porque:

- Sem tokens de longa duração armazenados em texto plano
- Tokens podem ser revogados sem regenerar chaves API
- Permissões com escopo definido por aplicação
- PKCE previne interceptação de códigos de autorização

**Passo 1: Registrar uma Developer Key no Canvas**

1. Vá para sua instância Canvas → Admin → Developer Keys
2. Clique em **+ Developer Key** → **API Key**
3. Configure:
   - **Key Name**: Canvas CLI
   - **Redirect URIs**: `http://localhost:8080/callback`
   - **Enforce Scopes**: Opcional (deixe desmarcado para acesso completo)
4. Salve e anote o **Client ID** e **Client Secret**

**Passo 2: Login com Canvas CLI**

```bash
# Login interativo (abre navegador)
canvas auth login https://seu-canvas.instructure.com \
  --client-id SEU_CLIENT_ID \
  --client-secret SEU_CLIENT_SECRET

# Para sistemas sem interface gráfica (entrada manual de código)
canvas auth login https://seu-canvas.instructure.com \
  --client-id SEU_CLIENT_ID \
  --client-secret SEU_CLIENT_SECRET \
  --mode oob
```

O CLI abre seu navegador para autorização do Canvas, então armazena tokens de forma segura no keyring do sistema (macOS Keychain, Windows Credential Manager, ou Linux Secret Service).

**Passo 3: Verificar Autenticação**

```bash
# Verificar status de autenticação
canvas auth status

# Testar com um comando simples
canvas users me
```

### Autenticação com Token API

Para configurações mais simples ou sistemas de automação sem acesso a navegador:

```bash
# Definir token para uma instância
canvas auth token set producao \
  --url https://seu-canvas.instructure.com \
  --token SEU_TOKEN_API
```

### Autenticação CI/CD

Para GitHub Actions, GitLab CI ou outros pipelines:

```bash
# Definir token via variável de ambiente
export CANVAS_TOKEN="seu-token-api"
export CANVAS_URL="https://seu-canvas.instructure.com"

# Ou usar o comando token set no seu script CI
canvas auth token set ci \
  --url "$CANVAS_URL" \
  --token "$CANVAS_TOKEN"
```

## Comandos Essenciais do Canvas CLI

### Tabela de Referência Rápida

| Comando                     | Descrição                   | Exemplo                                                                                 |
| --------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `canvas courses list`       | Listar seus cursos          | `canvas courses list -o json`                                                           |
| `canvas courses get ID`     | Obter detalhes do curso     | `canvas courses get 12345`                                                              |
| `canvas users me`           | Obter seu perfil            | `canvas users me`                                                                       |
| `canvas users list`         | Listar usuários em um curso | `canvas users list --course-id 123`                                                     |
| `canvas assignments list`   | Listar tarefas              | `canvas assignments list --course-id 123`                                               |
| `canvas submissions list`   | Listar entregas             | `canvas submissions list --course-id 123 --assignment-id 456`                           |
| `canvas submissions grade`  | Avaliar uma entrega         | `canvas submissions grade --course-id 123 --assignment-id 456 --user-id 789 --score 95` |
| `canvas enrollments list`   | Listar matrículas           | `canvas enrollments list --course-id 123`                                               |
| `canvas enrollments create` | Matricular um usuário       | `canvas enrollments create --course-id 123 --user-id 456`                               |
| `canvas auth status`        | Verificar status de auth    | `canvas auth status`                                                                    |
| `canvas doctor`             | Executar diagnósticos       | `canvas doctor`                                                                         |

### Explorando Cursos

```bash
# Listar seus cursos
canvas courses list

# Obter informações detalhadas de um curso
canvas courses get 12345

# Listar com saída personalizada
canvas courses list -o json --limit 50

# Buscar cursos
canvas courses list --search "Introdução a"
```

### Trabalhando com Usuários

```bash
# Obter seu próprio perfil
canvas users me

# Listar usuários em um curso
canvas users list --course-id 12345

# Buscar um usuário
canvas users list --search "joao.silva@universidade.edu"
```

### Gerenciando Tarefas

```bash
# Listar tarefas em um curso
canvas assignments list --course-id 12345

# Obter detalhes de uma tarefa
canvas assignments get --course-id 12345 --assignment-id 67890

# Listar entregas para avaliação
canvas submissions list --course-id 12345 --assignment-id 67890
```

## Formatos de Saída para Integração com Pipelines

Um dos recursos mais poderosos do Canvas CLI é sua saída flexível. Isso permite integração perfeita com outras ferramentas.

### JSON para APIs e Scripts

```bash
# Perfeito para processamento com jq
canvas courses list -o json | jq '.[].name'

# Obter campos específicos
canvas users me -o json | jq '{id, name, email}'
```

### CSV para Planilhas

```bash
# Exportar matrículas para CSV
canvas enrollments list --course-id 12345 -o csv > matriculas.csv

# Abrir diretamente no Excel/Google Sheets
canvas grades history --course-id 12345 -o csv
```

### YAML para Configuração

```bash
# Exportar estrutura do curso
canvas courses get 12345 -o yaml > curso-backup.yaml
```

### Tabela para Leitura Humana

```bash
# Formato padrão com cores e alinhamento
canvas courses list -o table
```

## Fluxos de Trabalho Avançados de Automação com Canvas CLI

Agora vamos explorar técnicas avançadas que podem economizar horas de trabalho manual. Todos os scripts incluem tratamento de erros apropriado para uso em produção.

### Fluxo 1: Gerenciamento de Matrículas em Massa

**Cenário**: Matricular 500 alunos de um arquivo CSV em um curso.

```bash
#!/bin/bash
# matricula-massa.sh - Matricular usuários em massa a partir de CSV
set -euo pipefail

COURSE_ID="${1:?Uso: $0 COURSE_ID ARQUIVO_CSV}"
CSV_FILE="${2:?Uso: $0 COURSE_ID ARQUIVO_CSV}"

# Validar pré-requisitos
command -v jq >/dev/null 2>&1 || { echo "Erro: jq é necessário" >&2; exit 1; }
[[ -f "$CSV_FILE" ]] || { echo "Erro: Arquivo não encontrado: $CSV_FILE" >&2; exit 1; }

# Formato CSV: email,funcao
# joao@uni.edu,student
# maria@uni.edu,ta

sucesso=0
falha=0

while IFS=',' read -r email funcao; do
  # Pular cabeçalho
  [[ "$email" == "email" ]] && continue
  [[ -z "$email" ]] && continue

  # Buscar usuário por email
  user_id=$(canvas users list --search "$email" -o json 2>/dev/null | jq -r '.[0].id // empty')

  if [[ -n "$user_id" ]]; then
    if canvas enrollments create \
      --course-id "$COURSE_ID" \
      --user-id "$user_id" \
      --type "${funcao}Enrollment" \
      --state active >/dev/null 2>&1; then
      echo "✓ Matriculado $email como $funcao"
      ((sucesso++))
    else
      echo "✗ Falha ao matricular $email" >&2
      ((falha++))
    fi
  else
    echo "✗ Usuário não encontrado: $email" >&2
    ((falha++))
  fi
done < "$CSV_FILE"

echo ""
echo "Resumo: $sucesso matriculados, $falha falharam"
[[ $falha -eq 0 ]] || exit 1
```

### Fluxo 2: Exportação Automatizada de Notas

**Cenário**: Exportar notas de múltiplos cursos em um relatório consolidado.

```bash
#!/bin/bash
# exportar-notas.sh - Exportar notas de todos os cursos ativos
set -euo pipefail

OUTPUT_DIR="${1:-./exportacoes-notas}"
mkdir -p "$OUTPUT_DIR"

# Validar pré-requisitos
command -v jq >/dev/null 2>&1 || { echo "Erro: jq é necessário" >&2; exit 1; }

echo "Obtendo cursos ativos..."
courses=$(canvas courses list -o json | jq -r '.[] | select(.workflow_state=="available") | "\(.id)|\(.name)"')

if [[ -z "$courses" ]]; then
  echo "Nenhum curso ativo encontrado"
  exit 0
fi

exportados=0
while IFS='|' read -r course_id course_name; do
  safe_name=$(echo "$course_name" | tr ' /' '_')
  output_file="$OUTPUT_DIR/${safe_name}_notas.csv"

  echo "Exportando: $course_name..."
  if canvas grades history --course-id "$course_id" -o csv > "$output_file" 2>/dev/null; then
    ((exportados++))
  else
    echo "  Aviso: Não foi possível exportar notas de $course_name" >&2
  fi
done <<< "$courses"

echo ""
echo "Exportados $exportados curso(s) para $OUTPUT_DIR"
```

### Fluxo 3: Deploy de Templates de Curso

**Cenário**: Criar múltiplas seções de curso a partir de um template.

```bash
#!/bin/bash
# deploy-secoes.sh - Criar seções de curso a partir de template
set -euo pipefail

TEMPLATE_COURSE="${1:?Uso: $0 TEMPLATE_COURSE_ID TERM_ID}"
TERM_ID="${2:?Uso: $0 TEMPLATE_COURSE_ID TERM_ID}"
ACCOUNT_ID="${3:-1}"

SECTIONS=("Seção A" "Seção B" "Seção C" "Seção D")

command -v jq >/dev/null 2>&1 || { echo "Erro: jq é necessário" >&2; exit 1; }

criados=0
for section in "${SECTIONS[@]}"; do
  echo "Criando: FIS 101 - $section"

  # Criar novo curso
  new_course=$(canvas courses create \
    --account-id "$ACCOUNT_ID" \
    --name "FIS 101 - $section" \
    --code "FIS101-${section// /}" \
    --term "$TERM_ID" \
    -o json 2>/dev/null)

  new_id=$(echo "$new_course" | jq -r '.id // empty')

  if [[ -z "$new_id" ]]; then
    echo "  ✗ Falha ao criar curso" >&2
    continue
  fi

  # Copiar conteúdo do template
  if canvas content-migrations create \
    --course-id "$new_id" \
    --source-course-id "$TEMPLATE_COURSE" \
    --type course_copy_importer >/dev/null 2>&1; then
    echo "  ✓ Curso $new_id criado com migração de conteúdo"
    ((criados++))
  else
    echo "  ✗ Falha ao iniciar migração de conteúdo para curso $new_id" >&2
  fi
done

echo ""
echo "Criados $criados de ${#SECTIONS[@]} seções"
```

### Fluxo 4: Avaliação em Lote com Comentários

**Cenário**: Avaliar todas as entregas de uma tarefa a partir de um arquivo de notas.

```bash
#!/bin/bash
# avaliar-lote.sh - Avaliar entregas a partir de CSV
set -euo pipefail

COURSE_ID="${1:?Uso: $0 COURSE_ID ASSIGNMENT_ID GRADES_CSV}"
ASSIGNMENT_ID="${2:?Uso: $0 COURSE_ID ASSIGNMENT_ID GRADES_CSV}"
GRADES_FILE="${3:?Uso: $0 COURSE_ID ASSIGNMENT_ID GRADES_CSV}"

[[ -f "$GRADES_FILE" ]] || { echo "Erro: Arquivo não encontrado: $GRADES_FILE" >&2; exit 1; }

# Formato CSV: student_id,nota,comentario
# 111,95,Excelente trabalho!
# 222,78,Bom esforço, revise a seção 3.

avaliados=0
falhas=0

while IFS=',' read -r student_id nota comentario; do
  [[ "$student_id" == "student_id" ]] && continue
  [[ -z "$student_id" ]] && continue

  if canvas submissions grade \
    --course-id "$COURSE_ID" \
    --assignment-id "$ASSIGNMENT_ID" \
    --user-id "$student_id" \
    --score "$nota" \
    --comment "$comentario" >/dev/null 2>&1; then
    echo "✓ Avaliado estudante $student_id: $nota"
    ((avaliados++))
  else
    echo "✗ Falha ao avaliar estudante $student_id" >&2
    ((falhas++))
  fi
done < "$GRADES_FILE"

echo ""
echo "Resumo: $avaliados avaliados, $falhas falharam"
[[ $falhas -eq 0 ]] || exit 1
```

### Fluxo 5: Migração de Curso Entre Instâncias

**Cenário**: Exportar um curso de staging e importar para produção usando formato Common Cartridge.

```bash
#!/bin/bash
# migrar-curso.sh - Migrar curso entre instâncias do Canvas
set -euo pipefail

STAGING_COURSE="${1:?Uso: $0 STAGING_COURSE_ID PROD_COURSE_ID}"
PROD_COURSE="${2:?Uso: $0 STAGING_COURSE_ID PROD_COURSE_ID}"
EXPORT_DIR="${3:-./exportacoes-curso}"

mkdir -p "$EXPORT_DIR"
command -v jq >/dev/null 2>&1 || { echo "Erro: jq é necessário" >&2; exit 1; }

echo "Passo 1: Criando exportação de conteúdo de staging..."
export_result=$(canvas content-exports create \
  --course-id "$STAGING_COURSE" \
  --instance staging \
  --type common_cartridge \
  -o json 2>/dev/null)

export_id=$(echo "$export_result" | jq -r '.id // empty')
if [[ -z "$export_id" ]]; then
  echo "Erro: Falha ao criar exportação" >&2
  exit 1
fi

echo "  ID da exportação: $export_id"
echo "  Aguardando a exportação terminar..."

# Aguardar a exportação terminar
max_attempts=60
attempt=0
while [[ $attempt -lt $max_attempts ]]; do
  status=$(canvas content-exports get \
    --course-id "$STAGING_COURSE" \
    --export-id "$export_id" \
    --instance staging \
    -o json 2>/dev/null | jq -r '.workflow_state // "unknown"')

  if [[ "$status" == "exported" ]]; then
    echo "  Exportação concluída!"
    break
  elif [[ "$status" == "failed" ]]; then
    echo "Erro: Exportação falhou" >&2
    exit 1
  fi

  ((attempt++))
  sleep 5
done

if [[ $attempt -ge $max_attempts ]]; then
  echo "Erro: Tempo esgotado" >&2
  exit 1
fi

echo ""
echo "Passo 2: Baixando arquivo de exportação..."
download_url=$(canvas content-exports get \
  --course-id "$STAGING_COURSE" \
  --export-id "$export_id" \
  --instance staging \
  -o json 2>/dev/null | jq -r '.attachment.url // empty')

export_file="$EXPORT_DIR/curso-${STAGING_COURSE}-export.imscc"
curl -sL "$download_url" -o "$export_file"
echo "  Baixado para: $export_file"

echo ""
echo "Passo 3: Importando para produção..."
canvas content-migrations create \
  --course-id "$PROD_COURSE" \
  --instance production \
  --type common_cartridge_importer \
  --file "$export_file"

echo ""
echo "Migração iniciada! Verifique o status com:"
echo "  canvas content-migrations list --course-id $PROD_COURSE --instance production"
```

### Fluxo 6: Administração de Cursos Assistida por IA com Claude

**Cenário**: Use o Claude Code CLI para gerenciar tarefas do Canvas de forma inteligente usando linguagem natural.

Com `claude -p` (modo prompt), você pode aproveitar a IA para analisar dados do Canvas. Envie a saída do CLI diretamente para o Claude para obter insights instantâneos:

```bash
# Enviar lista de cursos para Claude para análise de matrículas
canvas courses list -o json | claude -p "Analise esses cursos e identifique
quaisquer com menos de 10 matrículas. Mostre uma tabela resumo com recomendações."

# Analisar distribuição de notas a partir de dados enviados
canvas grades history --course-id 12345 -o json | claude -p "Calcule a
média, a distribuição de notas e identifique estudantes que possam precisar de apoio."

# Auditar tarefas com análise de IA
canvas assignments list --course-id 12345 -o json | claude -p "Identifique
tarefas que estejam vencidas mas não tenham entregas. Formate como uma lista
de verificação markdown que eu possa compartilhar com o instrutor."

# Deixar o Claude executar comandos autonomamente para tarefas complexas
claude -p "Tenho um arquivo CSV em estudantes.csv com colunas email,funcao.
Use canvas CLI para matricular esses estudantes no curso 12345.
Pule os que já estão matriculados e reporte os resultados."
```

**Exemplo: Geração Automatizada de Relatório Semanal**

```bash
#!/bin/bash
# relatorio-semanal.sh - Relatório do Canvas gerado por IA
set -euo pipefail

COURSE_ID="${1:?Uso: $0 COURSE_ID}"
REPORT_FILE="relatorio-canvas-$(date +%Y%m%d).md"

# Usar Claude para gerar um relatório inteligente
claude -p "Você tem acesso ao canvas CLI. Para o curso $COURSE_ID, por favor:
1. Obtenha os detalhes do curso
2. Liste as entregas recentes dos últimos 7 dias
3. Obtenha as contagens de matrícula atuais por função
4. Identifique quaisquer tarefas com prazo nos próximos 7 dias

Gere um relatório markdown bem formatado com:
- Visão geral do curso
- Resumo de atividade de entregas
- Detalhamento de matrículas
- Prazos próximos

Salve a análise em um relatório, seja conciso mas completo." > "$REPORT_FILE"

echo "Relatório gerado: $REPORT_FILE"
```

**Por Que CLI + IA Funciona**:

| Acesso Tradicional à API          | Canvas CLI + Agente IA             |
| --------------------------------- | ---------------------------------- |
| Tokens expostos ao contexto da IA | Tokens no keyring seguro           |
| A IA poderia vazar credenciais    | A IA só conhece os comandos        |
| Acesso ilimitado à API            | Delimitado por permissões do token |
| Sem trilha de auditoria           | Logging padrão do CLI              |
| Tratamento de erros complexo      | O CLI trata retentativas/paginação |

## Gerenciando Múltiplas Instâncias do Canvas

O Canvas CLI se destaca no gerenciamento de múltiplos ambientes Canvas:

```bash
# Adicionar instâncias
canvas config add producao \
  --url https://prod.instructure.com \
  --client-id PROD_CLIENT_ID

canvas config add staging \
  --url https://staging.instructure.com \
  --client-id STAGING_CLIENT_ID

# Definir instância padrão
canvas config use producao

# Sobrescrever por comando
canvas courses list --instance staging

# Verificar configuração atual
canvas config list
```

## Shell REPL Interativo para Canvas

Para exploração e consultas ad-hoc, o shell REPL é inestimável:

```bash
# Iniciar shell interativo
canvas shell

# Dentro do shell:
canvas> courses list
canvas> set course_id 12345
canvas> assignments list --course-id $course_id
canvas> history
canvas> help submissions
canvas> exit
```

**Recursos do REPL:**

- **Histórico de comandos** (1000 itens) com navegação por setas
- **Variáveis de sessão** para armazenar IDs entre comandos
- **Ctrl+R** para busca reversa no histórico
- **Autocompletar com Tab** para comandos

## Processamento de Eventos do Canvas em Tempo Real

O Canvas CLI inclui um listener de webhooks para automação em tempo real:

```bash
# Iniciar listener de webhooks
canvas webhook listen \
  --addr :8080 \
  --secret SEU_WEBHOOK_SECRET \
  --events submission_created,grade_change
```

**Casos de uso:**

- Disparar notificações quando tarefas são entregues
- Sincronizar notas automaticamente com sistemas externos
- Monitorar mudanças de matrícula em tempo real
- Integrar com Slack/Teams para atualizações de cursos

## Dicas de Otimização de Performance do Canvas CLI

### 1. Use Limitação de Resultados com Sabedoria

```bash
# Obtenha apenas o que precisa
canvas courses list --limit 10

# Para exportações grandes, processe em lotes
canvas enrollments list --course-id 12345 --limit 100 -o csv
```

### 2. Aproveite a Filtragem JSON com jq

```bash
# Deixe o jq fazer o trabalho pesado
canvas courses list -o json | jq '[.[] | {id, name}]'

# Filtre do lado do servidor quando possível
canvas assignments list --course-id 12345 --bucket upcoming
```

### 3. Processamento Paralelo em Scripts Shell

```bash
# Processar múltiplos cursos em paralelo
courses=$(canvas courses list -o json | jq -r '.[].id')

echo "$courses" | xargs -P 4 -I {} sh -c '
  canvas enrollments list --course-id {} -o csv > matriculas_{}.csv
'
```

### 4. Entendendo a Adaptação do Rate Limit

O Canvas CLI se adapta automaticamente aos limites da API:

```
Cota > 50%  → 5 requisições/segundo
Cota 20-50% → 2 requisições/segundo
Cota < 20%  → 1 requisição/segundo
```

Para automação intensiva, considere agendar durante horários de baixa atividade.

## Solução de Problemas do Canvas CLI

### Problemas Comuns

**Erros de Autenticação:**

```bash
# Verificar status de autenticação com detalhes
canvas auth status -v

# Re-autenticar
canvas auth logout
canvas auth login https://seu-canvas.instructure.com \
  --client-id SEU_CLIENT_ID \
  --client-secret SEU_CLIENT_SECRET

# Verificar acesso ao keyring
canvas doctor
```

**Rate Limiting:**

```bash
# Verificar status atual do rate limit
canvas auth status -v

# Adicionar delays em scripts
sleep 1  # Entre lotes
```

**Modo Debug:**

```bash
# Habilitar logging detalhado
canvas courses list -v

# Verificar configuração
canvas config show

# Executar diagnósticos completos
canvas doctor
```

## Recursos e Ferramentas Relacionadas

- **Repositório GitHub**: [github.com/jjuanrivvera/canvas-cli](https://github.com/jjuanrivvera/canvas-cli)
- **Documentação**: [jjuanrivvera.github.io/canvas-cli](https://jjuanrivvera.github.io/canvas-cli/)
- **Issues e Features**: [GitHub Issues](https://github.com/jjuanrivvera/canvas-cli/issues)

### Ecossistema de Automação do Canvas

O Canvas CLI funciona muito bem junto com:

- **[Canvas LMS Kit](/pt/blog/canvas-lms-kit-o-sdk-completo-de-php/)** - SDK PHP para construir integrações com Canvas e aplicações web
- **[Canvas MCP Server](https://github.com/jjuanrivvera/canvas-lms-mcp)** - Servidor Model Context Protocol para assistentes de IA como Claude Desktop. Enquanto o Canvas CLI é perfeito para agentes de IA baseados em terminal (como Claude Code), o servidor MCP permite integração de IA conversacional em interfaces de chat.

## Perguntas Frequentes

### O que é o Canvas CLI?

O Canvas CLI é uma ferramenta de interface de linha de comando para interagir com o Canvas LMS. Fornece mais de 280 comandos cobrindo todos os endpoints da API do Canvas, com recursos como autenticação OAuth 2.0, múltiplos formatos de saída e capacidades de processamento em lote.

### O Canvas CLI é gratuito e de código aberto?

Sim, o Canvas CLI é completamente gratuito e de código aberto sob a licença MIT. Você pode ver o código fonte, contribuir e usá-lo para qualquer finalidade em [github.com/jjuanrivvera/canvas-cli](https://github.com/jjuanrivvera/canvas-cli).

### Como instalo o Canvas CLI no macOS?

A forma mais fácil é usando o Homebrew: `brew tap jjuanrivvera/canvas-cli && brew install canvas-cli`. Você também pode baixar binários pré-compilados do GitHub Releases ou instalar via `go install` se você tem Go instalado.

### Posso usar o Canvas CLI com assistentes de IA?

Sim! O Canvas CLI foi projetado para funcionar com agentes de IA como o Claude Code. A IA pode executar comandos do Canvas sem acessar diretamente seus tokens de API - as credenciais são armazenadas de forma segura no keyring do seu sistema. Use `claude -p "seu prompt"` para aproveitar a IA em fluxos de trabalho complexos do Canvas.

### O Canvas CLI funciona com múltiplas instâncias do Canvas?

Sim, o Canvas CLI suporta gerenciamento multi-instância. Você pode configurar múltiplas instâncias do Canvas (produção, staging, desenvolvimento) e alternar entre elas usando `canvas config add` e `canvas config use`, ou sobrescrever por comando com a flag `--instance`.

## Conclusão

O Canvas CLI transforma como você interage com o Canvas LMS. Seja gerenciando um único curso ou automatizando operações em múltiplas instituições, o CLI fornece o poder e flexibilidade que você precisa.

Combinado com agentes de IA como o Claude Code, você pode automatizar fluxos de trabalho complexos usando linguagem natural enquanto mantém suas credenciais seguras. O CLI trata autenticação, rate limiting, paginação e tratamento de erros - você foca no que quer realizar.

Comece com comandos simples, gradualmente construa scripts de automação, e antes que perceba, tarefas que levavam horas serão completadas em segundos.

Boa automação!
