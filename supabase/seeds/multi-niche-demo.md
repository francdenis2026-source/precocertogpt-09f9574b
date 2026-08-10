# Ambiente de demonstração multi-nicho

Seed aplicado no projeto Supabase do Preço Certo com a identificação:

`service_settings.seed_suite = "multi_niche_demo_v1"`

Todos os estabelecimentos são dados internos de teste. O pagamento demo nunca deve criar cobrança real.

## Cenários

| Tipo | Estabelecimento | O que validar |
|---|---|---|
| grocery | Demo Mercado do Bairro | estoque, promoção, peso, entrega e retirada |
| supermarket | Demo Super Preço | alto volume, peso e estações Hortifruti/Açougue/Conferência |
| pizzeria | Demo Pizzaria Forno Certo | tamanhos, bordas, cozinha, forno e expedição |
| snack_bar | Demo Burger & Lanches | tamanho do lanche, adicionais, chapa e montagem |
| bakery | Demo Padaria Pão & Arte | venda por peso, bolo por tamanho, recheio obrigatório e encomenda |
| pharmacy | Demo Farmácia Saúde Certa | item comum, revisão farmacêutica e bloqueio de venda remota |
| restaurant | Demo Restaurante Sabor Local | tamanho de prato, adicionais, cozinha e entrega |
| beverage | Demo Bebidas Geladas | estoque e variante natural/gelada |
| pet_shop | Demo Pet Feliz | ração por embalagem e serviço de banho/tosa |
| cosmetics | Demo Bella Cosméticos | perfume por volume e estoque |
| services | Demo Serviços Feijó | serviços e agendamento |
| other | Demo Empório Regional | fluxo genérico de comércio local |

Cada estabelecimento possui 3 itens de catálogo, duas zonas de entrega e um pedido demonstrativo em um estágio diferente da operação.

## Acesso

A conta administrativa existente está vinculada como `owner` dos 12 estabelecimentos demo. O painel usa `pc:active_merchant_id` no localStorage para alternar o estabelecimento ativo através do componente `MerchantDemoSwitcher`.

A conta comum existente foi usada como cliente dos pedidos demonstrativos, permitindo validar `/meus-pedidos` com RLS real.

## Pagamento demo

A RPC `complete_demo_payment(uuid)` só aceita pedidos pertencentes ao usuário autenticado e somente quando o estabelecimento possui:

- `service_settings.demo_mode = true`
- `service_settings.allow_demo_payment = true`

O pagamento apenas altera o pedido de teste para `paid`, usa `payment_provider = "demo"` e registra `no_real_charge = true` no evento. Nenhuma transação Mercado Pago é criada.

## Limpeza segura

Para identificar os registros de teste:

```sql
select id, name, business_type
from public.merchants
where service_settings->>'seed_suite' = 'multi_niche_demo_v1';
```

A remoção deve começar por `merchants` filtrando exclusivamente essa marca; as tabelas filhas com `on delete cascade` acompanham o registro. Os `establishments` demo usam slug iniciado por `demo-` e devem ser removidos separadamente somente após conferir a lista.

## Regra

Nunca reutilizar a marca `multi_niche_demo_v1` em estabelecimentos reais.
