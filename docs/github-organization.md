# Organização do Guia da TI

A organização [guia-da-ti](https://github.com/guia-da-ti) é proprietária dos dois repositórios do projeto. A transferência foi verificada em 5 de outubro de 2026: os commits anteriores foram preservados e o GitHub Discussions continua ativado no repositório de dados. Na verificação final, a aplicação estava privada e o repositório de dados estava público.

Repositórios atuais:

- `guia-da-ti/guia-da-ti`: aplicação privada.
- `guia-da-ti/guia-da-ti-dados`: catálogo público, apoiadores e GitHub Discussions.

Os remotes locais, a URL do submódulo, os padrões da aplicação e os links da documentação foram atualizados para a organização.

Configuração da hospedagem:

- `GITHUB_APP_REPOSITORY=guia-da-ti/guia-da-ti`.
- `DISCUSSIONS_REPOSITORY=guia-da-ti/guia-da-ti-dados`.
- `VITE_DATA_REPOSITORY=https://github.com/guia-da-ti/guia-da-ti-dados` (exige novo build do frontend).
- Autorizações do aplicativo GitHub e credencial de leitura para o novo proprietário, conforme as políticas da organização.

Os padrões novos funcionam quando essas variáveis não estão definidas. Valores antigos configurados na hospedagem devem ser substituídos. Verificar também autorizações da credencial de leitura e do aplicativo OAuth para o novo proprietário, conforme as políticas da organização. O login para publicar como visitante exige configurar o aplicativo OAuth.

Depois da publicação na hospedagem, verificar leitura das conversas, contribuidores, publicação como visitante e links no domínio real. Atualizar o GitHub não comprova a atualização do site hospedado. O histórico de autoria dos commits permanece ligado aos respectivos autores.

Referência: [Transferência de repositórios no GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository).
