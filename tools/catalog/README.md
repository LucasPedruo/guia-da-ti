# Validação na aplicação

Este diretório contém o contrato aceito pela aplicação e seu validador confiável. Ele lê somente os JSONs de `database/data` e gera `dist/catalog.json`. Não importa módulos nem executa scripts do submódulo.

O schema e a taxonomia aqui representam a versão que a aplicação suporta. Ao ampliar campos ou IDs no repositório de dados, atualize também este contrato e seus testes antes de atualizar o submódulo. Cadastros permanecem exclusivamente em `guia-da-ti-dados`. Não copie o catálogo para cá.

```sh
npm ci
npm run validate
npm test
```
