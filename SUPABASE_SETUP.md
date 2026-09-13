# Posto Control — banco online

A etapa de banco online usa Supabase/Postgres.

## 1. Criar o projeto

Crie um projeto no Supabase e copie a URL do projeto e a chave **Publishable** (em projetos antigos ela pode aparecer como `anon`).

Coloque esses dois valores em `supabase-config.js`.

**Nunca coloque uma chave `service_role` ou `secret` no HTML/JavaScript publicado.**

## 2. Criar as tabelas

Abra o SQL Editor do Supabase e execute todo o conteúdo de `supabase/schema.sql`.

O schema cria:

- `profiles`: supervisor e gerentes, ligados ao Supabase Auth;
- `sales`: vendas por posto e gerente;
- `manager_calls`: chamados do supervisor para os gerentes;
- RLS para impedir que um gerente veja ou altere dados de outro posto.

## 3. Criar o primeiro supervisor

No Supabase, crie manualmente o primeiro usuário em **Authentication → Users**.

Depois insira o perfil correspondente em `public.profiles`, usando o mesmo UUID do usuário criado:

```sql
insert into public.profiles (id, username, full_name, role, station)
values ('UUID_DO_USUARIO', 'supervisor', 'Supervisor', 'supervisor', null);
```

## 4. Criação de gerentes

A criação de gerente deve ser feita por uma Edge Function usando a API administrativa do Supabase. A `service_role`/secret deve ficar somente no servidor da Edge Function, nunca no GitHub Pages.

Depois que a função estiver implantada, o painel do supervisor poderá chamar a função para criar o usuário Auth e o respectivo registro em `profiles`.

## 5. Publicação

O projeto pode continuar hospedado no GitHub Pages. O navegador usa a URL + chave Publishable do Supabase; a segurança dos dados fica no Supabase por meio de Auth + RLS.

## 6. Realtime

O schema adiciona `sales` e `manager_calls` à publicação `supabase_realtime`, permitindo atualizar o painel quando houver alterações em outro dispositivo.
