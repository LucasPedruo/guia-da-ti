---
name: humanizer-br
description: Revise trechos em portugues do Brasil para texto humano, curto e concreto quando uma pessoa for ler. Nao use para codigo, identificadores, logs, commits, payloads, JSON ou blocos de codigo.
metadata:
  short-description: Humaniza texto em pt-BR
---

# Humanizer BR

Revise estilo de texto que uma pessoa vai ler. A referencia e como explicar a mudanca para um colega do lado: frase curta, fato concreto, sem floreio.

## Entrada e saida

Trabalhe apenas nos trechos que o autor escreveu. Nunca reprocessar o arquivo inteiro. Isso infla o diff e pode desfazer revisao ja aprovada.

Para cada trecho, devolva:

- O texto revisado.
- A lista do que mudou, um item por regra aplicada. Inclua antes e depois quando a troca nao for obvia.

Se o trecho ja estiver limpo, diga que esta limpo e nao invente mudanca.

Quem chamou a skill aplica o resultado no arquivo e registra no resumo da tarefa o que mudou.

## Regras

Aplique nesta ordem quando fizer sentido.

1. Travessao em texto corrido

Nao use `—` em paragrafo. Troque por virgula, ponto ou parenteses.

Em lista do tipo `Item — explicacao`, prefira verbo:

- Antes: `Gerar resumo — condensa o atendimento ate o momento`
- Depois: `Gerar resumo condensa o atendimento ate o momento`

Excecao: em apps/docs, lista de definicao do padrao da base pode manter `Termo — explicacao`. A proibicao vale para paragrafo.

2. Ponto e virgula

Troque `;` por ponto. Duas frases curtas leem melhor que uma frase emendada.

3. Dois-pontos de enfase

Use dois-pontos so antes de lista ou exemplo.

- Antes: `vale por conta, e nao so por usuario: quem trabalha com duas contas...`
- Depois: `Vale por conta, e nao so por usuario. Quem trabalha com duas contas...`

4. Adjetivo vago

Troque adjetivo por fato, limite, numero ou efeito na tela.

Palavras comuns para cortar: `robusto`, `poderoso`, `completo`, `significativo`, `eficiente`, `intuitivo`, `moderno`, `avancado`, `inteligente`, `flexivel`, `otimizado`, `simples e rapido`.

- Antes: `Busca mais robusta`
- Depois: `A busca acha o codigo mesmo com hifen ou ponto`

5. Gerundio conclusivo

Corte ou reescreva com verbo direto no sujeito certo.

- Antes: `permitindo maior controle`
- Depois: `Voce controla...`

6. Frase acima de 25 palavras

Quebre em duas. Uma ideia por frase.

7. Enchimento

Corte: `e possivel`, `com o objetivo de`, `vale destacar que`, `e importante ressaltar`, `a fim de`, `no sentido de`, `de forma a`, `de modo que`.

Troque `atraves de` por `por` ou `pelo`.

8. Trio automatico

Evite tres adjetivos ou tres itens por reflexo, como `rapido, seguro e confiavel`. Dois bastam. Melhor ainda: use o fato concreto.

9. Voz e pessoa

Use voz ativa. Use segunda pessoa (`voce`) quando fala com o usuario. Escreva em portugues do Brasil. Evite anglicismo quando existe palavra corrente em portugues: `funcionalidade` no lugar de `feature`, `painel` no lugar de `dashboard`, salvo nome oficial de tela.

## Regras por tipo de texto

Interface: rotulo, placeholder, tooltip, titulo, descricao de secao, estado vazio, toast e erro dizem o que o controle faz e para quem. Nomeie a consequencia, nao o mecanismo. Use `Falar com o suporte`, nao `Solicitar mais recursos`. Rotulo curto, sem ponto final. Descricao de apoio em uma ou duas frases. Toast e erro dizem o que aconteceu e o que fazer agora, sem culpar quem clicou.

API e e-mail transacional: mensagem de erro e contrato. Se o frontend compara o texto, mudar quebra a tela. Confira `apps/admin/` antes de reescrever mensagem existente e mude os dois lados juntos.

Documentacao e changelog em `apps/docs`: o leitor nunca vai abrir um `.cs`. Evite vocabulario de codigo, como endpoint, DTO, flag e worker, salvo em pagina de API publica. Titulo em sentenca. Use negrito para elemento de interface.

Landing page: o texto e o produto. Headline e CTA seguem a mesma regua e precisam caber no espaco. Aplique tambem em `title`, `description` e texto de `opengraph-image`.

Descricao de PR, mensagem no Teams e e-mail: use o tom de colega.

## Fora do escopo

Nao humanize codigo, nome de identificador, mensagem de commit, comentario tecnico, log, bloco de codigo, tabela de rota, nome de campo, payload de exemplo ou JSON. Ali a forma vem do sistema. Humanizar payload quebra exemplo.

## Auditoria final

Depois de aplicar as regras, releia em voz alta. Se a frase nao sai do jeito que voce contaria para um colega, ainda esta formal demais.

Use `rg` nos arquivos editados para pegar sinais mecanicos:

```bash
rg -n "—|;" <arquivos-que-voce-editou>
```

## Exemplo

Antes:

```text
Implementamos uma busca mais robusta e inteligente no catalogo — agora e
possivel encontrar produtos mesmo com codigos formatados de forma diferente,
garantindo mais agilidade no atendimento; alem disso, o agente passa a
informar o estoque de cada item.
```

Depois:

```text
A busca no catalogo acha o produto mesmo quando o codigo vem com hifen, ponto
ou barra. O agente tambem mostra o estoque de cada item na lista.
```

O que mudou: travessao e ponto e virgula viraram ponto. `robusta e inteligente` e `mais agilidade` viraram o fato: hifen, ponto e barra. `e possivel` e `garantindo` sairam. A frase de 41 palavras virou duas.
