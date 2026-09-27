# Arquitectura

Monolito Next.js 16 (App Router) organizado por features de negocio, pensado
para un MVP de ~40 competidores. Requerimientos de producto en
[`../especificaciones.md`](../especificaciones.md).

## Stack

| Pieza | Elección |
| --- | --- |
| DB | PostgreSQL en **Supabase** + Drizzle (`server/db/`, driver `postgres-js`) |
| Auth | **Supabase Auth** (email + contraseña) vía `@supabase/ssr` |
| Archivos (videos, comprobantes) | Por decidir en Fase 2: Supabase Storage (1 GB gratis) o Cloudflare R2 |
| Email transaccional | Resend (Fase 2+) |
| Deploy | Vercel |

Los videos **nunca** pasan por una función de Vercel (límite de 4.5 MB): el
cliente sube directo al storage con una URL firmada que emite una Server Action.

## Base de datos

- Schema en `server/db/schema/`, migraciones en `server/db/migrations/`.
- `bun run db:generate` → genera SQL; `bun run db:migrate` → aplica; `bun run db:studio`.
- Drizzle solo gestiona el schema `public`; `auth.*` es de Supabase. `profiles.id` = `auth.users.id`.
- La app se conecta por el **transaction pooler** (`DATABASE_URL`, puerto 6543) con `prepare: false`; `drizzle-kit` usa el **session pooler** (`DIRECT_URL`, puerto 5432).
- **RLS activado sin políticas en todas las tablas** (`.enableRLS()`): la API
  pública de Supabase (publishable/anon key) no puede leer ni escribir nada.
  La app accede solo vía Drizzle (rol `postgres`) y autoriza en el DAL.
- Columnas en `snake_case` automáticamente (`casing: "snake_case"`).
- Fechas en `timestamptz`; se muestran en `America/Costa_Rica`.
- Por el tamaño del MVP: el estado de las semanas se deriva de las fechas (sin cron)
  y la clasificación se calcula con SQL (sin tabla `results` materializada).

## Carpetas

| Carpeta | Contenido |
| --- | --- |
| `app/` | Solo rutas y layouts. `(public)`, `(auth)`, `(dashboard)/dashboard`, `admin/`. |
| `app/api/` | Solo entradas HTTP que no pueden ser Server Actions: webhooks de pagos, callbacks de auth, streaming/URLs firmadas de video. |
| `features/<x>/` | Todo lo de un dominio (tournaments, subscriptions, videos, payments, users, notifications). |
| `server/` | Infraestructura compartida y `server-only`: DB, auth/sesión, adaptadores de pagos, storage y email. |
| `components/` | UI global sin lógica de dominio (navbar, primitives). |
| `lib/` | Utilidades sin dominio: `env.ts`, `constants.ts`. |
| `config/` | Configuración del sitio (navegación, metadata). |

> Los route groups `(x)` no añaden segmento a la URL. Dos grupos no pueden
> definir la misma ruta: por eso el área autenticada vive bajo `/dashboard/...`.

## Anatomía de una feature

Referencia: `features/tournaments/`.

```
features/tournaments/
├── components/        # UI del dominio
├── actions.ts         # "use server": autorizar → validar (zod) → delegar en server/
├── server/            # import "server-only"
│   ├── queries.ts     # lecturas (API pública para otras features)
│   └── mutations.ts   # escrituras + reglas de negocio
├── schemas.ts         # zod, compartido cliente/servidor
└── types.ts
```

Sin barrels `index.ts`: mezclar exports de cliente y servidor filtra código al bundle.

## Reglas de dependencias

- `app/` → `features/`, `components/`, `lib/`, `server/auth`. Nunca `server/db`.
- `features/x` → `server/`, `lib/`, `components/`. De otra feature solo importa `features/y/server/queries.ts` o `types.ts`.
- `server/` → solo `lib/`.
- `components/` y `lib/` no importan dominio.

Se hacen cumplir con `import/no-restricted-paths` en `eslint.config.mjs`. Cuando
aparezca una segunda feature, añade una zona por feature con `except` para su
`server/queries.ts`.

## Autenticación y autorización

- **Supabase Auth**: formularios propios en `/login`, `/register`,
  `/forgot-password` y `/reset-password` (`features/users/auth-actions.ts`).
  El registro guarda nombre, apellido y categoría en `user_metadata`.
- Los enlaces de email llegan a `app/auth/confirm/route.ts` (acepta `token_hash` o `code`).
- **`profiles`** guarda nombre, categoría y **rol**. Se crea en `/onboarding`
  (paso "Completar perfil", precargado con los datos del registro). Los emails
  listados en `ADMIN_EMAILS` reciben rol `admin`.
- `proxy.ts`: refresca la sesión de Supabase en cada request y redirige a
  `/login?next=…` si no hay sesión en rutas protegidas (chequeo optimista).
- `server/auth/session.ts`: `getAuthUser()` (solo JWT, vía `getClaims()`) y
  `getSession()` (JWT + perfil).
- `server/auth/dal.ts`: autorización **real**.
  - `verifySession()`: hay sesión.
  - `requireProfile()`: además, perfil completo (si no, redirige a `/onboarding`).
  - `requireRole("admin")`: además, rol.
  Llamarlas en layouts protegidos, en **cada** Server Action y en queries sensibles.

### Configuración en el dashboard de Supabase

1. **Authentication → URL Configuration**: Site URL (producción) y en Redirect
   URLs `http://localhost:3000/**` y `https://<dominio>/**`.
2. **Authentication → Email Templates** (recomendado, permite abrir el enlace
   en otro dispositivo): en "Confirm signup" usar
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/onboarding`
   y en "Reset password"
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`.
3. **SMTP propio (Resend) antes de producción**: el SMTP incluido de Supabase
   permite muy pocos emails por hora.
4. El plan gratuito pausa el proyecto tras 7 días sin actividad.

## Pagos (SINPE manual)

No hay pasarela: el competidor registra referencia + comprobante y un admin
aprueba. Inscripciones y videos extra comparten la tabla `payments` (`kind`).

## Pendiente

- Elegir storage (Supabase Storage o R2) y crear cuenta Resend (dominio verificado) antes de la Fase 2.
