# Magic Sandbox TCG

Es increible que toda esta aplicación esta aprovada por mi amigo imaginario: NASLOC (Not A Single Line Of Code) .. jajaja, todo el codigo lo escribió la IA de principio a fin sin ninguna modificación manual. Yo no tengo mucha idea de programación, digamos lo basico nomas, pero la IA me ha ayudado a crear esta aplicación de manera rápida y eficiente.

Una aplicación web Full Stack para jugar Magic: The Gathering en modo Sandbox (sin reglas forzadas), multijugador y en tiempo real. Eso si, abrazate del discord o de algun VOIP porque si no, lo tienes complicado jajajaj

## Stack
- **Frontend**: React, Vite, TypeScript, Tailwind CSS.
- **Backend**: Node.js, Express, Socket.IO, TypeScript.
- **Database**: MariaDB (vía Docker), Prisma ORM.
- **External API**: Scryfall.

## Requisitos
- Node.js v18+
- Docker y Docker Compose

## Configuración Inicial

1.  **Variables de Entorno**:
    Copia `.env.example` a `.env` en la raíz (o configura las variables en `backend/.env` y `frontend/.env` si corres manual).
    El `docker-compose.yml` ya tiene variables predeterminadas para entorno Docker.

2.  **Instalar Dependencias**:
    ```bash
    npm install
    cd backend && npm install
    cd frontend && npm install
    ```

## Ejecución en Desarrollo (Local)

1.  Levanta la base de datos:
    ```bash
    npm run db:up
    ```
    (Esto levanta solo MariaDB en puerto 30009 mapeado a 3306).

2.  Ejecuta migraciones y seed:
    ```bash
    npm run db:migrate
    npm run db:seed
    ```

3.  Corre backend y frontend concurrentemente:
    ```bash
    npm run dev
    ```
    - Backend: http://localhost:30007
    - Frontend: http://localhost:5173 (o puerto vite default)
    
    *Nota: Si usas docker-compose para todo, el frontend se expondrá en 30008.*

## Ejecución con Docker Compose (Producción/Completo)

Para levantar todo el stack (DB + Back + Front):

```bash
npm run docker:up
```

- Frontend accesible en: http://localhost:30008
- Backend accesible en: http://localhost:30007

**Nota**: Al levantar con Docker por primera vez, es posible que necesites correr las migraciones dentro del contenedor del backend o esperar a que la DB esté lista.
Puedes hacerlo con:
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

## Funcionalidades
- **Auth**: Login, Register, Refresh Tokens.
- **Deck Builder**: Búsqueda en Scryfall, gestión de decks.
- **Lobby**: Crear/Unirse a partidas (código corto).
- **Mesa de Juego**:
    - Zonas: Hand, Library, Graveyard, Exile, Battlefield.
    - Acciones: Robar, Mover, Tapear, Contadores, Vidas.
    - Sincronización en tiempo real vía Socket.IO.
    - Persistencia de estado en DB.

## Estructura
- `/backend`: API REST y Socket Server.
- `/frontend`: SPA React.
- `/docker-compose.yml`: Orquestación.
