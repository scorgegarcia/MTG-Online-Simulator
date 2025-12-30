# Magic-TRAE Changelog
## [25.12.29]
### New Features
- **Encantamientos**: Ya se pueden "encantar" cartas con encantamientos asi como funcionaban ya los equipamientos.
- **Castear Cartas**: La misma hotkey para tap/untap a las cartas en el campo de batalla, sirve para castear cartas hacia el campo de batalla.
- **Changelog**: Se crea este changelog para seguir el progreso del proyecto y notificar cambios.

### Changes
- **Contadores**: Se movieron los contadores a la parte superior izquierda de las cartas para que no tapen el costo de maná de las cartas
- **Algoritmo de Shuffle**: Alí tenía razón. Se mejoró el algoritmo de shuffle de Fisher Yates pues ya se usaba este algoritmo pero usaba numeros pseudoaleatoreos generados por js (era random matematico), ahora son True Random gracias a la entropía que ofrece la criptografía, porque js era basura para generar randomness... jajajaj

### Bug/Fix
- **Draw Bug**: Se corrigió un bug donde si hacias clic en la biblioteca si hacia draw de la carta que sigue, pero si hacias drag-n-drop traía la carta de abajo de la biblioteca.

