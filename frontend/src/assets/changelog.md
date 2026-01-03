# Magic-TRAE Changelog

## [26.1.2]
![](https://i.ibb.co/rRTbTjcH/image.png)
### New Features
- **Nuevo Editor y Visualizador de Cartas Personalizadas**: Se agrega la posibilidad de poder crear cartas a partir de un editor completo de cartas, o tambien poder traer tu carta creada por fuera, solo proporcionarías la URL de la imagen de la carta completa. o si usas el editor completo, puedes traer la imagen del arte de tu carta a la imagen de la carta.
![Nueva Funcion: Editor de Cartas Personalizadas](https://i.ibb.co/F4tJtvjB/image.png)

- **Hotkey de Thinking**: Se agrega una hotkey para poder activar y/o desactivar el modo "Thinking" (de pensar) en el campo de batalla. Asi puedes ver las cartas que tienes en tu mano y los efectos que tienen. (Hotkey: .) pero es configurable en la configuración de la partida.

## Changes
- **Mejor retroalimentacion al usuario**: Agregados sonidos para interacciones con hover, clics, feedback de audio y visual para diversos menús, botones y acciones como agregar cartas personalizadas desde su modal, donde no se puede ver si realmente se agregó, porque el modal esta encima, pero ahora se escucha y sale un "toast" indicando que la acción se realizó.

## [25.12.30]
![](https://i.ibb.co/NnW4yKDL/image.png)
### New Features

![Nueva Funcion: Arrow](https://i.ibb.co/KjJFJGyX/image.png)
- **Botón de Arrow**: Se agrega un botón para poder activar y/o desactivar el modo "Arrow" (de flechas) en el campo de batalla. Asi puedes seleccionar cartas y hacer targets a otras cartas, usalo para señalar bloqueadores, etc. (Hotkey: A) pero es configurable en la configuración de la partida.
![Ejemplo de interacción con el botón de Arrow](https://i.ibb.co/XZtTV37D/image.png)

### Changes
- **Hotkey para Pass**: Se agregó una hotkey para hacer pass de la partida (Hotkey: P) pero es configurable en la configuración de la partida.
- **Cooldown a Pass**: Se agrega un cooldown a la hotkey de pass para que no se pueda usar demasiado rápido evitando saturar la red.

## [25.12.29]
### New Features
- **Modal de Daño de Comandante**: Se crea un modal para poder ver el daño de comandante que ha recibido cada jugador por parte de otros jugadores.

![Ejemplo de Modal de Daño de Comandante](https://i.ibb.co/Z6N99V7Q/image.png)

- **Encantamientos**: Ya se pueden "encantar" cartas con encantamientos asi como funcionaban ya los equipamientos.

![Ejemplo de Encantamiento aplicado](https://i.ibb.co/7NSkcf97/image.png)

- **Castear Cartas**: La misma hotkey para tap/untap a las cartas en el campo de batalla, ahora tambien sirve para castear cartas hacia el campo de batalla.
- **Changelog**: Se crea este changelog para seguir el progreso del proyecto y notificar cambios.
- **Pagina de Perfil**: Se crea una pagina de perfil para que el usuario pueda administrar su cuenta, ver información de sus partidas, ir a sus partidas, clasificarlas como ganadas o perdidas, etc.
- **Modal de Vida**: Se crea un modal para poder cambiar la vida de un jugador en cualquier momento de la partida.

![Ejemplo de Modal de Vida](https://i.ibb.co/kg3XhvqK/image.png)

- **Historial de partidas**: Se agrega un historial de partidas en la pagina de perfil para que el usuario pueda ver sus partidas anteriores y clasificarlas como ganadas o perdidas de manera manual para que pueda llevar un control de estadisticas.

### Changes
- **Contadores**: Se movieron los contadores a la parte superior izquierda de las cartas para que no tapen el costo de maná de las cartas
- **Algoritmo de Shuffle**: Alí tenía razón. Se mejoró el algoritmo de shuffle de Fisher Yates pues ya se usaba este algoritmo pero usaba numeros pseudoaleatoreos generados por js (era random matematico), ahora son True Random gracias a la entropía que ofrece la criptografía, porque js era basura para generar randomness... jajajaj
- **Deck Selection**: Se mejoró la seleccion de deck para que el usuario pueda reconsiderar usar el deck que bloqueó en el lobby de la partida, y si decide cambiar de deck, la partida no podrá iniciar hasta que todos los jugadores hayan confirmado sus cambios.

### Bug/Fix
- **Draw Bug**: Se corrigió un bug donde si hacias clic en la biblioteca si hacia draw de la carta que sigue, pero si hacias drag-n-drop traía la carta de abajo de la biblioteca.
- **Log de Partidas**: El botón de colapsar log quedaba detras de las propias lineas de log haciendo que fuera dificil o imposible dependiendo del navegador colapsar el log. Ahora el botón está en un div distinto al log para que no quede detras de las lineas de log.