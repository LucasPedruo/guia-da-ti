# Como usar o painel de anúncios

Você cadastra uma mensagem de uma empresa e escolhe onde ela aparece no fórum. O painel também controla as datas e a troca entre anúncios.

## Entrar no painel

1. Abra o Guia na sua máquina.
2. Entre com a conta GitHub **LucasPedruo**.
3. Clique na sua foto, no canto superior direito.
4. Escolha **Administrar anúncios**.

Você também pode abrir `http://localhost:5080/admin/anuncios`. Use o mesmo endereço do site em que você entrou com GitHub. O login de `localhost` não acompanha você ao abrir o site pelo IP da rede.

Somente sua conta administra os anúncios. Os visitantes veem apenas as campanhas habilitadas e dentro do período escolhido.

## Criar seu primeiro anúncio

1. Clique em **Novo anúncio**.
2. Preencha **Empresa**, **Título** e **Descrição**.
3. Em **Site de destino**, coloque a página que deve abrir quando alguém clicar em **Abrir site**.
4. Envie uma imagem ou preencha **Link da imagem**. Você pode salvar sem imagem.
5. Em **Onde exibir**, marque pelo menos um espaço.
6. Deixe **Prioridade de rotação** em **1** para começar.
7. Confira **Início** e **Término**. Deixe o término vazio se a campanha não tiver uma data para acabar.
8. Marque **Habilitar campanha no período escolhido** se quiser que o anúncio participe da exibição.
9. Confira a prévia e clique em **Salvar anúncio**.

O cadastro começa com a opção de habilitar desmarcada. Se você salvar assim, o anúncio fica **Pausado**.

### Exemplo de preenchimento

Este exemplo é fictício e não cria uma campanha no site.

| Campo | Exemplo |
| --- | --- |
| Empresa | Empresa Exemplo |
| Título | Conheça nossa ferramenta para equipes de tecnologia |
| Descrição | Organize as tarefas da sua equipe. Veja como a ferramenta funciona no nosso site. |
| Site de destino | `https://example.com` |
| Imagem | Um arquivo PNG da empresa, com até 2 MB |
| Onde exibir | Lista do fórum |
| Prioridade de rotação | 1 |
| Início | Hoje, em um horário que já passou |
| Término | A data e o horário combinados com a empresa |
| Habilitar campanha no período escolhido | Marcado |

Depois de salvar, o estado deve ser **Em exibição**. Abra o **Início** e procure o bloco **Publicidade** entre as conversas.

A lista precisa ter pelo menos uma conversa para mostrar esse bloco. Se houver outros anúncios ativos, a seleção pode mostrar outro primeiro.

## Escolher onde a empresa aparece

### Usar somente imagem e link

Em **Formato do anúncio**, escolha **Somente imagem e link**. Informe a imagem e o site de destino. O nome da empresa é opcional nesse formato.

A imagem ocupa toda a área do anúncio e abre o site ao clicar. Use uma imagem horizontal na proporção 4:1 para evitar cortes.

Para exibir título e descrição com imagem pequena, escolha **Imagem e texto**. A prévia acompanha o formato escolhido.

O menu dos três pontos abre **Sobre este espaço**, que leva a `/empresas`. A opção **Ocultar anúncios por 4 horas** esconde a publicidade nesse navegador.

Essa preferência permanece ao trocar de página ou fechar o navegador. Depois de quatro horas, os espaços voltam a aparecer.

| Opção no cadastro | Onde o visitante vê o anúncio |
| --- | --- |
| **Lista do fórum** | Entre as conversas do **Início** |
| **Conversas do fórum** | Dentro de uma conversa, depois do tópico e antes da área de comentários |
| **Discussões de Estudar** | Na discussão de um item de Estudar, quando esse item tem uma conversa disponível |

Você pode marcar mais de um espaço no mesmo cadastro. O anúncio participa da rotação de cada espaço escolhido.

O painel não altera as empresas apoiadoras do **Início** e de **Sobre**. Essa apresentação é separada dos anúncios.

## Entender vagas, cadastros e rotação

Esses três controles fazem coisas diferentes.

| Controle | O que significa | Valor inicial |
| --- | --- | --- |
| **Máximo de cadastros** | Quantos anúncios você pode guardar no painel, incluindo pausados e encerrados | 100 |
| **Vagas por espaço** | Quantos anúncios podem disputar aquele espaço durante o mesmo período | 5 |
| **Rotação em segundos** | Quanto tempo esperar antes de buscar o próximo anúncio, enquanto o espaço está visível | 45 segundos |

**Cinco vagas não são cinco anúncios aparecendo juntos.** Cada bloco de publicidade mostra apenas um anúncio por vez.

Imagine que você cadastrou anúncios das empresas A, B e C. Os três podem participar da lista do fórum. O visitante vê um deles e, depois do intervalo, o espaço escolhe outro.

Se as cinco vagas estiverem ocupadas no mesmo período, o sexto anúncio será recusado para aquele espaço. Você pode ajustar as datas ou pausar uma campanha.

Outra opção é aumentar a quantidade de vagas e clicar em **Salvar configurações**. O painel permite de 1 a 20 vagas por espaço.

As reservas futuras também contam. Uma campanha agendada pode ocupar a última vaga no período em que outra empresa quer anunciar.

Os cartões **Vagas em uso agora** mostram somente as campanhas em exibição no momento. Eles não mostram o total reservado em datas futuras.

## Escolher a prioridade

Comece com **1** para todas as campanhas. Use um valor maior se uma parceria precisar de mais chances na seleção.

- Com uma campanha disponível, o espaço continua mostrando essa campanha.
- Com duas campanhas, elas se alternam.
- Com três ou mais, a prioridade influencia a escolha entre as alternativas ao anúncio anterior.

Prioridade **10** não significa dez exibições seguidas nem uma porcentagem garantida. O intervalo de troca continua sendo o mesmo para todas as campanhas.

A troca funciona enquanto o espaço está na tela e a aba está visível. Ao voltar para a aba ou para o espaço, ele consulta as campanhas novamente.

## Entender o estado de uma campanha

| Estado | O que está acontecendo | O que conferir |
| --- | --- | --- |
| **Pausado** | A campanha está desabilitada | Clique em **Habilitar** quando quiser ativá-la |
| **Agendado** | A campanha está habilitada, mas o início ainda não chegou | Confira a data e o horário de início |
| **Em exibição** | A campanha está habilitada e dentro do período | Ela pode ser escolhida nos espaços marcados |
| **Encerrado** | A data de término já passou | Edite as datas se quiser exibir novamente |

**Em exibição** significa que a campanha pode ser selecionada. Não significa que ela aparece para todos os visitantes ao mesmo tempo.

Para atualizar esses estados na tela do painel, use o botão de atualizar ao lado de **Novo anúncio**.

## Editar, pausar ou excluir

### Ligar ou desligar toda a publicidade

No início do painel, a área **Publicidade no site** mostra **Habilitada** ou **Desabilitada**.

Clique em **Desabilitar todos os anúncios** para interromper a exibição nos três espaços. Clique em **Habilitar todos os anúncios** para retomar.

Esse controle preserva os cadastros, as datas e as pausas individuais. Uma campanha pausada ou encerrada continua sem aparecer quando você liga a publicidade novamente.

A escolha fica salva no servidor. Um anúncio já aberto pode permanecer até a próxima consulta de rotação. Ao desabilitar, o bloco inteiro desaparece, inclusive o espaço reservado.

### Alterar uma campanha

- **Lápis** abre o cadastro para alterar texto, imagem, datas e espaços.
- **Pausar** interrompe a participação na rotação e mantém o cadastro e os contadores.
- **Habilitar** permite participar da rotação, respeitando as datas e as vagas.
- **Lixeira** exclui o cadastro e seus contadores. O painel pede confirmação.

Use **Pausar** quando quiser interromper temporariamente uma campanha. Para retomar uma campanha encerrada, edite o término antes de habilitá-la.

Um anúncio que já estava aberto na tela de um visitante pode permanecer até a próxima consulta de rotação.

## Ler exibições e cliques

Uma **exibição** conta quando pelo menos metade do anúncio fica visível por um segundo, com a aba aberta.

Um **clique** conta quando alguém abre o site pelo botão ou pela imagem do anúncio.

Os números não são pessoas únicas. A mesma pessoa pode ver uma campanha novamente e gerar outra exibição. A prévia do cadastro não soma contadores.

Clique no botão de atualizar para consultar os totais mais recentes.

## Quando algo não aparece

| Problema | O que fazer |
| --- | --- |
| O menu não mostra **Administrar anúncios** | Confira se você entrou como **LucasPedruo**. Atualize a página depois de entrar. |
| O anúncio foi salvo, mas não aparece | Confira se está **Em exibição** e se você abriu um dos espaços marcados. |
| O bloco mostra outra empresa | Há rotação. Espere a próxima troca com o bloco visível. |
| A lista do Início não mostra publicidade | Confira se há pelo menos uma conversa na lista. |
| O item de Estudar não mostra publicidade | Confira se o item tem uma discussão disponível. |
| O painel informa que o espaço está lotado | Ajuste as datas, pause outra campanha ou aumente o limite daquele espaço. |
| O contador continua em zero | A prévia não conta. Abra o espaço público e mantenha o anúncio visível por pelo menos um segundo. Depois atualize o painel. |
| A imagem não aparece | Envie PNG, JPG ou WebP de até 2 MB. Para um link, confira se ele abre a imagem diretamente. |
| O painel pede para atualizar a página | Atualize e confira se sua conta continua conectada antes de tentar novamente. |

## Onde ficam os dados

Os anúncios ficam salvos no servidor do Guia. Eles não ficam guardados apenas no navegador.

Reiniciar o servidor preserva os cadastros. Excluir uma campanha pelo painel remove também seus contadores.

Os dados deste ambiente local ainda precisam ser transferidos quando o site for colocado em outra hospedagem. Enviar um commit não envia as campanhas cadastradas.

As instruções para quem cuida da hospedagem ficam em [Administração de anúncios](publicidade.md).
