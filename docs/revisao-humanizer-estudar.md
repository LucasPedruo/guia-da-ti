# Revisão de texto de Estudar

Revisão em 07/10/2026 com [humanizer-br](../.agents/skills/humanizer-br/SKILL.md). O escopo inclui apenas os textos novos de Estudar e da curadoria. Cadastros JSON, textos antigos e mensagens da API foram preservados.

## Ordenação

Texto revisado em `docs/study.md`.

> O padrão é **Mais hypado**. Você também pode ordenar por comentários, interações ou nota média. Empates ficam em ordem alfabética. No empate de notas, a quantidade de avaliações vem primeiro.

- Enchimento e pessoa. “Também é possível ordenar” virou “Você também pode ordenar”.
- Ponto e vírgula virou ponto.
- O nome do controle passou para negrito.

## Armazenamento

Texto revisado em `docs/study.md`.

> O armazenamento segue o registro existente de contas. Ele usa escrita atômica, sincroniza acessos simultâneos em uma instância e mantém os dados fora do Git. Preserve `App_Data` em um volume persistente e faça backup. Para usar múltiplas instâncias, configure um banco compartilhado.

- Dois-pontos de ênfase virou ponto.
- Ponto e vírgula virou ponto.
- Voz ativa. “Sincronização de concorrência” virou “sincroniza acessos simultâneos”.

## Criação e recuperação de conversas

Texto revisado em `docs/study.md`.

> O primeiro comentário cria um tópico no GitHub Discussions, em nome do visitante autenticado. A categoria padrão é **Geral**, configurável por `STUDY_DISCUSSION_CATEGORY`.

> Se o salvamento do vínculo falhar, a recuperação procura o tópico diretamente no repositório. Ela não depende da indexação da busca.

> A leitura exige a configuração existente de Discussions. As escritas usam exclusivamente o OAuth do visitante.

- Frases longas foram divididas. A condição de recuperação passou para a primeira frase.
- Ponto e vírgula virou ponto.
- O nome da categoria passou para negrito.

## Origem dos cadastros

Texto revisado em `docs/study.md`.

> Os cadastros continuam vindo do catálogo público do GitHub. A curadoria inicial reúne 64 recursos verificados em 07/10/2026. As fontes estão em Curadoria de Estudar.

- A frase longa foi dividida em três, com origem, quantidade e referência em frases separadas.
- Ponto e vírgula virou ponto. O link da referência foi mantido no arquivo.

## Condições de acesso

Texto revisado na documentação da curadoria.

> Preços, bolsas, calendário, carga horária, vagas e pré-requisitos podem mudar. Confira as condições na fonte oficial indicada no cadastro.

> Think Python 3ª edição e a tradução Pense em Python 2ª edição são materiais de edições e idiomas distintos.

- Dois-pontos de ênfase virou ponto.
- Voz ativa. “Os cadastros encaminham à fonte oficial” virou uma instrução para quem lê.
- A barra entre “edições/idiomas” virou “e”.

## Formações imersivas

Texto revisado na documentação da curadoria.

> As formações imersivas, como a 42 São Paulo, foram agrupadas com bootcamps. Os textos distinguem essas formações de diplomas universitários e não atribuem a elas a duração de um bootcamp curto.

- A frase acima de 25 palavras foi dividida.
- Ponto e vírgula virou ponto.
- “Deixam claro” foi substituído pelo fato que os textos distinguem.

## Cadastro do roadmap.sh

Texto revisado na documentação da curadoria.

> São 64 recursos. O roadmap.sh possui um único cadastro para a página principal. Suas trilhas internas não são listadas separadamente.

- Ponto e vírgula virou ponto.

## Fonte e data

Texto revisado na documentação da curadoria.

> Cada cadastro ocupa um arquivo JSON no catálogo público. A URL abaixo é a fonte primária usada na verificação editorial. A data também fica em updatedAt.

- Ponto e vírgula virou ponto.

## Conferência do freeCodeCamp

Texto revisado na documentação da curadoria.

> O currículo utiliza renderização no navegador. Propósito e acesso aberto também foram conferidos no repositório do mantenedor.

- Ponto e vírgula virou ponto. O link do repositório foi mantido.

## Verificação de links

Texto revisado na documentação da curadoria.

> O catálogo inclui as URLs oficiais corrigidas do IFSP e do portal de graduação da UFC. Os endereços inicialmente rejeitados não foram mantidos. Udemy e Codecademy bloquearam a verificação automática. Suas páginas oficiais foram conferidas pela navegação de pesquisa.

- Ponto e vírgula virou ponto.
- “Responderam com proteção anti-automação ao GET” virou “bloquearam a verificação automática”.
- A explicação do bloqueio e a conferência no navegador passaram para frases separadas.

## Falha ao carregar atividade

Texto revisado na interface.

> A atividade dos itens não carregou. Tente novamente.

- “Não foi possível carregar a atividade dos itens” virou o fato e a próxima ação.

## Falha ao salvar

Texto revisado na interface.

> Não conseguimos salvar. Tente novamente.

- “Não foi possível salvar” virou uma mensagem com a próxima ação.

## Trechos sem mudança

Os demais rótulos e textos de apoio novos de Estudar estão limpos. Não receberam alterações. Travessões usados como indicador de dado indisponível e nomes oficiais nas tabelas foram preservados.

Os novos parágrafos sobre imagens em `docs/study.md` também estão limpos. As frases descrevem onde os arquivos ficam, como carregam e como conferir novas imagens. Não exigiram mudanças de estilo.

Os novos rótulos **Tipo de instituição**, **Pública** e **Privada**, as mensagens de validação e a explicação do filtro estão limpos. Não exigiram mudanças de estilo.
