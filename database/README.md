# Dados públicos do Guia da TI

Um arquivo por recurso, taxonomia central e JSON Schema. Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

```sh
npm ci
npm run validate
npm test
npm run format:check
```

O resultado está em `dist/catalog.json`. Entregue esse arquivo à aplicação por `CATALOG_PATH`. Os exemplos desta fundação são fictícios e estão identificados com `demo: true`.
