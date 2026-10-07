# Revisão dos textos de contribuição

Revisão em 07/10/2026 com [humanizer-br](../.agents/skills/humanizer-br/SKILL.md). O escopo inclui os textos novos do dialog, da prévia e do envio de imagens. Inclui também o aviso de comentário alterado nesta tarefa.

## Textos revisados

- Dialog: “Preencha os dados e confira a prévia antes de enviar sua sugestão.” O trecho já está limpo. Usa voz ativa e diz o que fazer.
- Imagem: “Imagem opcional. Envie PNG, JPG ou WebP de até 2 MB ou informe um link HTTPS.” O trecho já está limpo. Duas frases apresentam a escolha e o limite.
- Erro de imagem: “Escolha uma imagem PNG, JPG ou WebP de até 2 MB.” O trecho já está limpo. Diz como corrigir o envio.
- Arquivo ausente: “A imagem não foi encontrada. Envie o arquivo novamente.” O trecho já está limpo. Separa o ocorrido da próxima ação.
- Prévia: “Nome do recurso”, “O resumo aparece aqui” e “Adicione uma imagem”. Os trechos já estão limpos. Rótulos curtos, sem ponto final.
- Comentário: “Seu comentário será público no Guia e no GitHub, em nome de {login}, na discussão deste recurso.” A referência à criação do tópico saiu. O texto informa onde o comentário aparece.

## O que mudou

- Consequência na interface: “A primeira mensagem abre o tópico deste item no fórum” saiu. A sugestão aprovada preserva sua conversa. Cadastros antigos recebem uma apresentação do recurso, separada do comentário.
- Frases curtas e fatos concretos: os textos de imagem informam formato, limite e próxima ação. Os trechos que já estavam limpos foram mantidos.

O build, os testes do backend e os testes do catálogo passaram. O teste final no navegador foi dispensado pelo usuário.
