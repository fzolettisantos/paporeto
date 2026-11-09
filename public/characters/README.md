# Caricaturas

Coloque aqui as caricaturas **autorizadas** dos participantes (Oberdan ou titulares dos direitos).

```
public/characters/<slug-do-participante>/<ranking>/<estado>.webp
```

- `<ranking>`: `falou-merda`, `sabio` ou `bala-do-veio`
- `<estado>`: `top`, `middle`, `bottom` (e, opcionalmente, `neutral`)
- Formatos aceitos: `.avif`, `.webp` ou `.png` — prefira WebP/AVIF com fundo transparente,
  quadrado (ex.: 512×512) e o rosto centralizado com a mesma margem em todos os arquivos.

O `npm run dev` / `npm run build` gera `src/generated/character-manifest.json` com os arquivos encontrados.
Expressões que faltarem usam o placeholder ilustrado neutro — o site nunca troca por outra expressão.

Também é possível enviar caricaturas pelo painel `/admin` (Supabase Storage).
