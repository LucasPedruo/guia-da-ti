# Organização do Guia da TI

O nome do espaço que reúne os repositórios no GitHub é **organização**. Ela pode representar a comunidade Guia da TI, com pessoas responsáveis pela administração. O destino ainda precisa ser definido pelo responsável pelo projeto; nenhum repositório foi transferido.

Repositórios atuais:

- `LucasPedruo/guia-da-ti`: aplicação.
- `LucasPedruo/guia-da-ti-dados`: catálogo, apoiadores, contribuidores e GitHub Discussions.

Após definir ou criar a organização, verificar permissão de criação de repositórios e ausência de repositórios com os mesmos nomes. Usar a transferência de propriedade dos dois repositórios existentes para preservar o histórico, issues, PRs, estrelas e configurações.

Atualizar na mesma entrega:

- Remotes locais da aplicação e de `database/`.
- URL em `.gitmodules` e sincronização do submódulo.
- `GITHUB_APP_REPOSITORY`, `DISCUSSIONS_REPOSITORY` e `VITE_DATA_REPOSITORY` na hospedagem.
- Padrões de repositório em `App.tsx`, `Discussions.cs`, `DiscussionWriter.cs` e `Contributors.cs`.
- Links e nomes nos READMEs, `ARCHITECTURE.md` e `database/CONTRIBUTING.md`.
- Autorizações do aplicativo GitHub e credencial de leitura para o novo proprietário, conforme as políticas da organização.

Depois, verificar clonagem com submódulo, Actions, leitura pública das conversas, publicação como visitante e links no domínio real. O GitHub redireciona os endereços antigos dos repositórios; os remotes e configurações devem usar os endereços novos. O histórico de autoria dos commits permanece ligado aos respectivos autores.

Referência: [Transferência de repositórios no GitHub](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository).
