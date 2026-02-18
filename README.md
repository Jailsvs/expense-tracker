# 💰 Expense Tracker PWA

Aplicação Progressive Web App (PWA) para controle de despesas mensais, construída com **Angular 18**, suporte a **Firebase Firestore** e modo offline com **dados mockados**.

---

## 📋 Funcionalidades

### 🏠 Despesas Mensais (`/monthly-expenses`)
Tela principal do sistema. Exibe e gerencia as despesas do mês/ano selecionado.

| Funcionalidade | Descrição |
|---|---|
| **Filtro Mês/Ano** | Seleciona o período desejado; ao trocar, carrega automaticamente |
| **Carregar Despesas Fixas** | Importa todas as despesas fixas cadastradas para o mês (sem duplicatas por `expenseId`) |
| **Carregar Mês Anterior** | Copia despesas vinculadas a fixas do mês anterior, recalculando dias úteis de vencimento |
| **Nova Despesa (Manual)** | ⭐ Abre modal para adicionar despesa avulsa, sem vínculo com despesa fixa |
| **Edição Inline** | Descrição, valor e datas editáveis diretamente no grid |
| **Marcar como Pago** | Checkbox atualiza `isPaid` e `paidDate` automaticamente |
| **Excluir** | Remove a despesa com confirmação via modal |
| **Dashboard** | Gráfico de pizza por grupo com totais (total, pago, pendente) |
| **Totalizadores** | Total, Pago e A Pagar exibidos no topo (mobile) e no rodapé da tabela |

#### Badge de Tipo (coluna "Tipo")
| Badge | Cor | Significado |
|---|---|---|
| `DD` | 🟢 Verde | Débito Direto (despesa fixa com `isDirectDebit=true`) |
| `—` | ⚫ Cinza | Despesa Fixa sem débito direto |
| `M` | 🟡 Amarelo | **Manual** — despesa avulsa (`expenseId=null`) |

---

### ➕ Nova Despesa Manual (Ad-Hoc)
Modal dedicado para adição de despesas não recorrentes.

**Campos:**
| Campo | Tipo | Obrigatório | Default |
|---|---|---|---|
| Descrição | Texto (mín. 3 chars) | ✅ | — |
| Valor (R$) | Numérico > 0 | ✅ | — |
| Vencimento | Data | ✅ | Dia 10 do mês selecionado |
| Grupo | Select | ✅ | Primeiro grupo disponível |
| Informações Adicionais | Texto livre | ❌ | — |

**Regras:**
- `expenseId = null` — não vinculada a despesa fixa
- `isDirectDebit = false` — nunca é débito direto
- `isPaid = false` — sempre criada como não paga
- **Não é copiada** ao usar "Carregar Mês Anterior"

---

### 📌 Despesas Fixas (`/expenses`)
Cadastro das despesas recorrentes que servem de base para os meses.

| Campo | Descrição |
|---|---|
| Descrição | Nome da despesa |
| Valor | Valor padrão (pode ser alterado no mês) |
| Dia de Pagamento | Dia do mês (calculado em dias úteis) |
| Grupo | Categoria |
| Débito Direto | Se é debitado automaticamente |
| Info Adicional | Observações livres |

---

### 🗂️ Grupos (`/expense-groups`)
Categorias das despesas.

| Campo | Descrição |
|---|---|
| Nome | Identificação do grupo |
| Ícone | Imagem ou SVG para exibição |

---

### ⚙️ Configurações (`/config`)
Permite configurar a fonte de dados da aplicação.

| Opção | Descrição |
|---|---|
| **Firebase Firestore** | Configuração com chave JSON do projeto Firebase |
| **Dados Mockados** | Modo offline com dados de demonstração (padrão) |

---

## 🏗️ Arquitetura Técnica

### Stack
| Tecnologia | Versão | Uso |
|---|---|---|
| Angular | 18 | Framework principal |
| TypeScript | 5.x | Linguagem |
| Angular Material | 18 | Componentes de UI (Dialog, Button) |
| Bootstrap | 5.x | Layout e utilitários CSS |
| Bootstrap Icons | 1.x | Ícones |
| Firebase SDK | 10.x | Banco de dados (Firestore) |
| date-fns | 3.x | Manipulação de datas |
| localforage | — | Persistência de configurações (IndexedDB) |

### Estrutura de Pastas

```
src/
└── app/
    ├── core/
    │   ├── models/
    │   │   ├── monthly-expense.model.ts   ← Interfaces principais + CreateAdHocExpenseDto
    │   │   ├── expense.model.ts
    │   │   ├── expense-group.model.ts
    │   │   └── api-response.model.ts
    │   └── services/
    │       ├── FIREBASE-api.service.ts    ← Camada de acesso Firebase/Mock
    │       ├── FIREBASE-config.service.ts ← Configuração e persistência
    │       ├── api.service.ts             ← Legacy (mantido por compatibilidade)
    │       ├── business-days.service.ts   ← Cálculo dias úteis
    │       └── toast.service.ts           ← Notificações
    │
    ├── features/
    │   ├── monthly-expenses/
    │   │   ├── components/
    │   │   │   ├── dashboard-chart/       ← Gráfico de pizza
    │   │   │   └── add-adhoc-expense-modal/ ← ⭐ NOVO modal despesa manual
    │   │   ├── pages/
    │   │   │   └── monthly-manager/       ← Tela principal
    │   │   └── services/
    │   │       └── monthly-expense.service.ts
    │   │
    │   ├── expenses/
    │   │   ├── pages/expense-form/ e expense-list/
    │   │   └── services/expense.service.ts
    │   │
    │   ├── expense-groups/
    │   │   ├── pages/group-form/ e group-list/
    │   │   └── services/expense-group.service.ts
    │   │
    │   └── config/
    │       └── pages/config-form/
    │
    ├── layout/
    │   └── header/                        ← Navbar com menu responsivo
    │
    └── shared/
        ├── components/
        │   ├── confirmation-dialog/       ← Modal reutilizável (confirmar / carregar)
        │   ├── loading/                   ← Spinner
        │   └── toast/                     ← Notificações toast
        └── pipes/
            └── currency-br.pipe.ts        ← Formatação R$ pt-BR
```

---

## 🗄️ Modelo de Dados — Firestore

### Collection: `monthly_expenses`
| Campo | Tipo | Descrição |
|---|---|---|
| `_id` | string | ID gerado pelo Firestore |
| `expenseId` | string \| null | Referência à despesa fixa; **null** = manual |
| `month` | number | 1–12 |
| `year` | number | Ex: 2026 |
| `description` | string | Nome da despesa |
| `amount` | number | Valor em R$ |
| `dueDate` | Timestamp | Data de vencimento |
| `isPaid` | boolean | Status de pagamento |
| `paidDate` | Timestamp \| null | Data do pagamento |
| `groupId` | string | Referência ao grupo |
| `isDirectDebit` | boolean | Débito direto; sempre **false** para manuais |
| `additionalInfo` | string | Observações |
| `createdAt` | Timestamp | Criação |
| `updatedAt` | Timestamp | Última atualização |

### Collection: `expenses` (Despesas Fixas)
| Campo | Tipo | Descrição |
|---|---|---|
| `_id` | string | ID Firestore |
| `description` | string | Nome |
| `amount` | number | Valor padrão |
| `paymentDay` | number | Dia de pagamento (base para cálculo dia útil) |
| `groupId` | string | Grupo |
| `isDirectDebit` | boolean | Débito direto |
| `additionalInfo` | string | Observações |

### Collection: `expense_groups`
| Campo | Tipo | Descrição |
|---|---|---|
| `_id` | string | ID Firestore |
| `name` | string | Nome do grupo |
| `icon` | string | Base64 da imagem/SVG |
| `iconType` | string | MIME type do ícone |

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js ≥ 18
- npm ≥ 9
- Angular CLI 18: `npm install -g @angular/cli@18`

### Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd expense-tracker-pwa

# Instalar dependências
npm install
```

### Executar em Desenvolvimento

```bash
ng serve
```
Acesse: [http://localhost:4200](http://localhost:4200)

> Por padrão, a aplicação inicia com **dados mockados** (sem necessidade de Firebase).

### Build de Produção

```bash
ng build --configuration production
```
Arquivos gerados em `dist/`.

---

## 🔥 Configurar Firebase (Opcional)

Se desejar persistir dados no Firebase Firestore:

1. Crie um projeto em [console.firebase.google.com](https://console.firebase.google.com)
2. Adicione um app Web e copie a configuração JSON
3. Ative o **Firestore Database** (modo produção)
4. No app, acesse `/config` e cole os dados da configuração
5. Salve — o Firebase é inicializado automaticamente

### Regras Firestore (desenvolvimento)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 🔄 Fluxo de Uso Típico

```
1. Acesse /monthly-expenses
2. Selecione Mês e Ano
3. (Mês vazio) → Modal pergunta como carregar:
   ├── "Despesas Fixas"  → Importa todas as despesas fixas cadastradas
   └── "Mês Anterior"    → Copia despesas fixas do mês anterior (recalcula vencimentos)
4. Para adicionar despesa pontual:
   └── Clique em "+ Nova Despesa" → Preencha o modal → Criar
5. Edite valores/datas diretamente no grid
6. Marque como pago conforme os pagamentos ocorrem
7. Visualize o Dashboard para análise por grupo
```

---

## 📐 Regras de Negócio

| Regra | Descrição |
|---|---|
| **Dias úteis** | Vencimentos calculados pelo `BusinessDaysService` (pula sábados, domingos e feriados nacionais) |
| **Sem duplicatas (fixas)** | `loadFixedExpenses` filtra por `expenseId` para não duplicar |
| **Sem duplicatas (mês anterior)** | `loadPreviousMonthExpenses` filtra por `expenseId` e ignora despesas manuais |
| **Despesa manual não é copiada** | `expenseId = null` é ignorado no filtro do "Mês Anterior" |
| **DD sempre false em manuais** | `isDirectDebit` é fixo em `false` para despesas ad-hoc |
| **Sempre não pago ao criar** | Toda despesa nova (fixa ou manual) inicia com `isPaid = false` |

---

## 🧩 Componentes Principais

| Componente | Arquivo | Descrição |
|---|---|---|
| `MonthlyManagerComponent` | `monthly-manager/` | Tela principal — grid + filtros + dashboard |
| `AddAdHocExpenseModalComponent` | `add-adhoc-expense-modal/` | ⭐ Modal para despesa manual |
| `DashboardChartComponent` | `dashboard-chart/` | Gráfico de pizza com totais por grupo |
| `ConfirmationDialogComponent` | `confirmation-dialog/` | Modal genérico de confirmação e de carregamento |
| `HeaderComponent` | `layout/header/` | Navbar responsiva com menu mobile |
| `ToastComponent` | `shared/toast/` | Notificações no canto da tela |
| `LoadingComponent` | `shared/loading/` | Spinner de carregamento |

---

## 🔑 Interfaces TypeScript Principais

```typescript
// Despesa mensal (fixa ou manual)
interface MonthlyExpense {
  expenseId?: string | null; // null = despesa manual
  isDirectDebit: boolean;    // false para manuais
  // ...
}

// DTO para criação de despesa manual
interface CreateAdHocExpenseDto {
  description: string;    // obrigatório, mín. 3 chars
  amount: number;         // obrigatório, > 0
  dueDate: Date;          // obrigatório
  groupId: string;        // obrigatório
  additionalInfo: string; // opcional
}
```

---

## 🧪 Dados de Demonstração (Mock)

Quando sem Firebase configurado, o sistema usa dados mockados com:
- **4 despesas mensais** no mês atual
- **Grupos:** Moradia, Transporte, Alimentação, Outros
- **Despesas fixas** de exemplo

---

## 📄 Licença

Projeto privado — todos os direitos reservados.
