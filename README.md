# Site GDOIN

Site institucional do Grupo de Dosimetria e Instrumentação Nuclear, Departamento de Energia Nuclear da Universidade Federal de Pernambuco.

[Acessar o site](https://luancesarcode.github.io/site-gdoin/)

## Estrutura

Os arquivos públicos estão em `site/`: páginas HTML, CSS, JavaScript, imagens e fontes locais. Este repositório contém somente o novo site e sua publicação, com histórico próprio.

## Publicação

O workflow `.github/workflows/pages.yml` valida as páginas, os links locais, os recursos CSS e a sintaxe JavaScript. As alterações em `main` são publicadas automaticamente pelo GitHub Actions no GitHub Pages. Também é possível executar o workflow manualmente.

Para validar localmente com Python 3.12 ou superior:

```sh
python .github/scripts/build-pages.py --check
```

Para gerar o pacote público em um checkout sem a pasta `_site/`:

```sh
python .github/scripts/build-pages.py
```
