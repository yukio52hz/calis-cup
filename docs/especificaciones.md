> **Nota:** especificación original del producto. El stack usa Supabase
> (PostgreSQL + Auth) como indica §48, con **Drizzle** como ORM y
> autorización en el servidor (DAL) en lugar de políticas RLS por usuario.
> Ver [`architecture/overview.md`](architecture/overview.md) para las
> decisiones técnicas vigentes y las simplificaciones del MVP.

# TORNEO ONLINE DE CALISTENIA

## 1. Descripción general

Aplicación web **mobile-first** para gestionar un torneo online de calistenia femenino y masculino.

El torneo tiene:

* 4 semanas.
* 4 retos.
* 1 clasificación acumulada.
* Una categoría femenina.
* Una categoría masculina.
* Inscripción mediante SINPE.
* Revisión y aprobación manual por parte del administrador.
* Envío de videos directamente desde la aplicación.
* Sistema de puntos.
* Posibilidad de comprar videos extra mediante SINPE.
* Notificaciones por email.
* Administración completa del torneo.

La aplicación reemplaza el flujo que actualmente se realiza mediante Telegram.

---

# 2. Concepto del torneo

## TORNEO ONLINE

**FEMENINO Y MASCULINO**

**4 SEMANAS · 4 RETOS · 1 CLASIFICACIÓN**

Cada lunes se publica un nuevo reto.

El competidor tiene hasta el domingo para:

1. Realizar el set.
2. Grabar su video.
3. Subirlo a la aplicación.
4. Esperar la revisión.
5. Recibir su resultado y puntos.

Los puntos obtenidos cada semana se acumulan para determinar la clasificación final.

---

# 3. Roles

La aplicación tendrá dos roles principales.

## 3.1 Competidor

El competidor podrá:

* Registrarse.
* Iniciar sesión.
* Crear y editar su perfil.
* Seleccionar categoría femenina o masculina.
* Solicitar inscripción al torneo.
* Realizar el pago mediante SINPE.
* Registrar la referencia/comprobante del pago.
* Esperar aprobación del administrador.
* Recibir confirmación por email.
* Ver el torneo.
* Ver el reto activo.
* Ver las reglas.
* Ver penalizaciones.
* Ver videos de ejemplo.
* Subir su video.
* Consultar el estado de su envío.
* Ver su resultado.
* Ver sus puntos.
* Ver su posición.
* Ver la clasificación.
* Comprar un intento/video extra.
* Realizar el pago del video extra mediante SINPE.
* Esperar aprobación del administrador.
* Recibir autorización para subir el nuevo video.
* Consultar sus intentos anteriores.
* Consultar su historial de resultados.

## 3.2 Administrador

El administrador podrá:

* Iniciar sesión.
* Gestionar competidores.
* Revisar solicitudes de inscripción.
* Revisar comprobantes de SINPE.
* Aprobar o rechazar inscripciones.
* Crear y configurar el torneo.
* Crear las 4 semanas.
* Publicar retos.
* Configurar ejercicios.
* Configurar penalizaciones.
* Subir videos de ejemplo.
* Revisar videos enviados.
* Aprobar o rechazar videos.
* Registrar tiempos.
* Registrar penalizaciones.
* Registrar resultados.
* Gestionar puntos.
* Gestionar clasificación.
* Revisar solicitudes de videos extra.
* Ver comprobantes de SINPE.
* Aprobar o rechazar pagos de videos extra.
* Autorizar nuevos intentos.
* Gestionar usuarios.
* Enviar/activar notificaciones.
* Consultar estadísticas.

---

# 4. Mobile-first

La aplicación debe diseñarse primero para teléfonos.

Las resoluciones principales serán:

* 320 px.
* 360 px.
* 375 px.
* 390 px.
* 430 px.

Posteriormente se adaptará para:

* Tablet.
* Laptop.
* Desktop.

La experiencia principal debe ser móvil porque el competidor utilizará principalmente su teléfono para:

* Consultar el reto.
* Grabar el video.
* Seleccionar el video.
* Subirlo.
* Consultar resultados.
* Revisar la clasificación.

---

# 5. Navegación del competidor

En móvil se recomienda navegación inferior.

```text
┌──────────────────────────┐
│ TORNEO CALIS       👤    │
├──────────────────────────┤
│                          │
│      CONTENIDO           │
│                          │
│                          │
├──────────────────────────┤
│ 🏠      🏆      🎥     👤 │
│Inicio Ranking Videos Perfil│
└──────────────────────────┘
```

Secciones principales:

* Inicio.
* Clasificación.
* Videos.
* Perfil.

---

# 6. Registro

El usuario podrá registrarse desde la aplicación.

Campos iniciales:

* Nombre.
* Apellido.
* Email.
* Contraseña.
* Confirmación de contraseña.
* Categoría:

  * Femenino.
  * Masculino.

Opcionalmente:

* Teléfono.
* Nombre de usuario.
* Foto de perfil.

Después del registro:

```text
Registro
   ↓
Cuenta creada
   ↓
Completar perfil
   ↓
Solicitar inscripción
```

---

# 7. Inscripción al torneo

La inscripción será independiente del registro de usuario.

El usuario puede tener una cuenta sin estar inscrito todavía en el torneo.

## Flujo

```text
Usuario registrado
       ↓
Ver torneo
       ↓
Inscribirse
       ↓
Ver costo
       ↓
Realizar SINPE
       ↓
Registrar pago
       ↓
Enviar comprobante
       ↓
Estado: Pendiente
       ↓
Administrador revisa
       ↓
Aprobado
       ↓
Usuario queda inscrito
```

---

# 8. Precio de inscripción

Costo:

**₡2.500**

El texto promocional será:

> 4 semanas de competencia
> 4 retos
> 1 video por semana
> Acumulación de puntos
> El 100% de las inscripciones va para premios.

---

# 9. Pago mediante SINPE

Para simplificar la primera versión, el pago se realizará mediante SINPE.

La aplicación mostrará los datos necesarios para realizar el pago.

Ejemplo:

```text
INSCRIPCIÓN

Costo:
₡2.500

Realiza el SINPE al número:

8888-8888

Una vez realizado el pago:

1. Ingresa el número de referencia.
2. Sube el comprobante.
3. Envía la solicitud.

[ YA REALICÉ EL PAGO ]
```

El usuario deberá registrar:

* Monto.
* Número de referencia.
* Fecha del pago.
* Comprobante.

---

# 10. Estado de inscripción

La inscripción tendrá estados:

```text
pending_payment
pending_review
approved
rejected
```

Flujo:

```text
pending_payment
       ↓
pending_review
       ↓
approved
```

Si el administrador rechaza:

```text
pending_review
       ↓
rejected
```

El administrador podrá dejar una razón:

> Comprobante ilegible.

> Monto incorrecto.

> Número de referencia inválido.

---

# 11. Notificación de inscripción

Cuando el usuario envía el pago:

### Email al administrador

Asunto:

> Nueva solicitud de inscripción

Contenido:

> Un nuevo competidor ha enviado una solicitud de inscripción al torneo.

Información:

* Nombre.
* Email.
* Categoría.
* Monto.
* Referencia SINPE.
* Fecha.
* Comprobante.

Botón:

**Revisar inscripción**

---

Cuando el administrador aprueba:

### Email al competidor

Asunto:

> ¡Tu inscripción fue aprobada!

Contenido:

> Tu inscripción al Torneo Online ha sido aprobada. Ya puedes participar en los retos del torneo.

Botón:

**Ir al torneo**

---

Cuando el administrador rechaza:

### Email al competidor

Asunto:

> Tu inscripción necesita revisión

Contenido:

> No fue posible aprobar tu inscripción.

Debe incluir:

* Motivo.
* Instrucciones para corregirlo.
* Opción para volver a enviar la información.

---

# 12. Estado del torneo para el competidor

Antes de ser aprobado:

```text
┌──────────────────────────┐
│ INSCRIPCIÓN              │
│                          │
│ 🟡 Pendiente de revisión │
│                          │
│ Tu pago está siendo      │
│ revisado por el equipo.  │
│                          │
│ Te enviaremos un email   │
│ cuando sea aprobado.     │
└──────────────────────────┘
```

Después:

```text
┌──────────────────────────┐
│ ✅ INSCRIPCIÓN APROBADA  │
│                          │
│ Ya estás dentro del     │
│ torneo.                  │
│                          │
│ [ VER RETO ]             │
└──────────────────────────┘
```

---

# 13. Torneo

El torneo tendrá:

```text
Torneo
│
├── Semana 1
│   └── Reto 1
│
├── Semana 2
│   └── Reto 2
│
├── Semana 3
│   └── Reto 3
│
└── Semana 4
    └── Reto 4
```

Cada semana tendrá:

* Fecha de inicio.
* Fecha de finalización.
* Reto.
* Ejercicios.
* Repeticiones.
* Reglas.
* Penalizaciones.
* Video de ejemplo.
* Fecha límite.
* Resultados.
* Puntos.

---

# 14. Publicación del reto

Cada lunes se habilita un nuevo reto.

Ejemplo:

```text
LUNES

🔥 NUEVO RETO

SEMANA 2

Disponible desde:
Lunes 6:00 AM

Fecha límite:
Domingo 11:59 PM
```

El administrador podrá publicar el reto manualmente o programar la publicación.

---

# 15. Pantalla del reto

```text
┌──────────────────────────┐
│ ← Semana 2              │
├──────────────────────────┤
│                          │
│       RETO #2            │
│                          │
│       MUSCLE UP          │
│                          │
│ ──────────────────────── │
│                          │
│ OBJETIVO                 │
│ Completar el set en el   │
│ menor tiempo posible.    │
│                          │
│ VIDEO DE EJEMPLO         │
│                          │
│ ┌──────────────────────┐ │
│ │         ▶            │ │
│ └──────────────────────┘ │
│                          │
│ REGLAS                   │
│ • Regla 1                │
│ • Regla 2                │
│ • Regla 3                │
│                          │
│ PENALIZACIONES           │
│                          │
│ Repetición incorrecta    │
│ +5 segundos              │
│                          │
│ [ SUBIR MI VIDEO ]       │
└──────────────────────────┘
```

---

# 16. Subida de video

El usuario podrá:

* Grabar un video.
* Seleccionar un video de la galería.

La aplicación debe funcionar correctamente en navegadores móviles.

Flujo:

```text
Subir video
     ↓
Seleccionar/grabar
     ↓
Vista previa
     ↓
Confirmar
     ↓
Subir
     ↓
Procesar
     ↓
Enviado
```

---

# 17. Estado del video

Los videos tendrán estados:

```text
pending
under_review
approved
rejected
```

Ejemplo:

```text
VIDEO ENVIADO

🟡 Pendiente de revisión

Tu video fue recibido correctamente.

Te notificaremos cuando sea revisado.
```

---

# 18. Revisión del video

El administrador tendrá una bandeja de videos pendientes.

```text
VIDEOS PENDIENTES

┌──────────────────────────────┐
│ Juan Pérez                   │
│ Semana 2                     │
│ Masculino                    │
│ Enviado: 24 Sep 10:32 AM     │
│                              │
│ [ REVISAR ]                  │
└──────────────────────────────┘
```

---

# 19. Pantalla de revisión

```text
┌──────────────────────────────────┐
│ VIDEO #458                       │
├──────────────────────────────────┤
│                                  │
│             ▶ VIDEO              │
│                                  │
├──────────────────────────────────┤
│ Competidor: Juan Pérez           │
│ Categoría: Masculino             │
│ Semana: 2                        │
│                                  │
│ Tiempo registrado:               │
│ 02:34                            │
│                                  │
│ Penalizaciones:                  │
│ +5 segundos                      │
│                                  │
│ Resultado final:                 │
│ 02:39                            │
│                                  │
│ Observación:                     │
│ ┌──────────────────────────────┐ │
│ │ Repetición #8 incorrecta.    │ │
│ └──────────────────────────────┘ │
│                                  │
│ [ APROBAR ]     [ RECHAZAR ]    │
└──────────────────────────────────┘
```

---

# 20. Penalizaciones

Las penalizaciones serán configurables por reto.

Ejemplo:

```text
+5 segundos

Muscle Up
Pistol
Toes to Bar
Pull Up
Chin Up
```

```text
+3 segundos

Push Up
Dip
Squat
Squat con salto
Desplante
```

El administrador podrá configurar:

* Ejercicio.
* Penalización.
* Tipo de penalización.
* Descripción.

---

# 21. Resultado final

Ejemplo:

```text
Tiempo realizado:

02:34

Penalización:

+5 segundos

Resultado final:

02:39
```

El sistema utilizará el resultado final para establecer la posición semanal.

---

# 22. Sistema de puntos

Ejemplo:

```text
1.º → 100 puntos
2.º → 95 puntos
3.º → 90 puntos
4.º → 85 puntos
5.º → 80 puntos
...
```

El sistema debe permitir configurar los puntos desde el panel administrativo.

No deben estar hardcodeados.

---

# 23. Clasificación semanal

```text
🏆 CLASIFICACIÓN

SEMANA 2

MASCULINO

┌────┬──────────────┬──────┐
│ #  │ Competidor   │ PTS  │
├────┼──────────────┼──────┤
│ 1  │ Juan         │ 100  │
│ 2  │ Pedro        │ 95   │
│ 3  │ Carlos       │ 90   │
│ 4  │ Luis         │ 85   │
└────┴──────────────┴──────┘
```

El usuario podrá cambiar entre:

```text
FEMENINO | MASCULINO
```

---

# 24. Clasificación acumulada

Los puntos de las cuatro semanas se acumulan.

```text
┌────┬────────────┬─────┬─────┬─────┬─────┬───────┐
│ #  │ Competidor │ S1  │ S2  │ S3  │ S4  │ TOTAL │
├────┼────────────┼─────┼─────┼─────┼─────┼───────┤
│ 1  │ Juan       │100  │ 95  │100  │ 90  │ 385   │
│ 2  │ Pedro      │ 95  │100  │ 90  │ 95  │ 380   │
│ 3  │ Carlos     │ 90  │ 90  │ 95  │ 90  │ 365   │
└────┴────────────┴─────┴─────┴─────┴─────┴───────┘
```

La clasificación final se obtiene después de la semana 4.

---

# 25. Video extra

Si el competidor quiere mejorar su resultado durante la semana, puede comprar un video/intentarlo nuevamente.

Costo:

**₡500**

Ejemplo:

```text
TU RESULTADO

02:35

POSICIÓN ACTUAL

#12

────────────────────

¿Quieres mejorar tu tiempo?

Video extra
₡500

[ COMPRAR VIDEO EXTRA ]
```

---

# 26. Pago del video extra

El pago también será mediante SINPE.

Flujo:

```text
Competidor
     ↓
Comprar video extra
     ↓
Ver información de SINPE
     ↓
Realizar pago
     ↓
Ingresar referencia
     ↓
Subir comprobante
     ↓
Enviar solicitud
     ↓
Estado: Pendiente
     ↓
Administrador revisa
     ↓
Aprobado
     ↓
Se habilita nuevo intento
```

---

# 27. El usuario NO puede subir el video extra inmediatamente

Este punto es importante.

Después de realizar el pago:

```text
Pago realizado
      ↓
Solicitud enviada
      ↓
🟡 Pendiente de aprobación
```

El botón de subir el nuevo video permanecerá bloqueado:

```text
[ 🔒 SUBIR VIDEO EXTRA ]

Esperando aprobación del pago.
```

Una vez aprobado:

```text
✅ PAGO APROBADO

Ya puedes realizar un nuevo intento.

[ SUBIR VIDEO EXTRA ]
```

Esto evita que alguien pueda realizar intentos adicionales sin haber pagado.

---

# 28. Notificación de video extra

Cuando alguien solicita un video extra:

### Email al administrador

Asunto:

> Nueva solicitud de video extra

Contenido:

> Juan Pérez ha solicitado un video extra para la Semana 2.

Información:

* Competidor.
* Torneo.
* Semana.
* Resultado actual.
* Monto.
* Referencia SINPE.
* Comprobante.

Botón:

**Revisar solicitud**

---

Cuando el administrador aprueba:

### Email al competidor

Asunto:

> Video extra aprobado

Contenido:

> Tu pago fue aprobado. Ya puedes realizar un nuevo intento para mejorar tu resultado de la Semana 2.

Botón:

**Subir nuevo video**

---

Cuando se rechaza:

### Email al competidor

Asunto:

> Video extra no aprobado

Contenido:

> No fue posible aprobar tu solicitud.

Debe mostrar:

* Motivo.
* Información necesaria para corregir el problema.

---

# 29. Historial de intentos

Cada video debe mantenerse como un intento independiente.

Ejemplo:

```text
SEMANA 2

Intento #1
02:35
Aprobado

Intento #2
02:31
Aprobado

Intento #3
02:34
Aprobado

────────────────

MEJOR RESULTADO

02:31
```

El sistema utilizará el mejor resultado válido del competidor para la clasificación semanal.

---

# 30. Reglas del video extra

El sistema debe controlar:

* Si el competidor está inscrito.
* Si la semana está activa.
* Si todavía está dentro del plazo.
* Si el competidor tiene permitido otro intento.
* Si el pago fue aprobado.
* Cuántos videos extra ha comprado.
* Cuál es su mejor resultado.

No se debe permitir comprar/subir un video extra cuando la semana ya terminó.

---

# 31. Notificaciones

La aplicación debe contar con notificaciones por email.

Eventos principales:

## Usuario

Recibir email cuando:

* Se registra correctamente.
* Envía una inscripción.
* Su inscripción es aprobada.
* Su inscripción es rechazada.
* Se publica un nuevo reto.
* Su video fue recibido.
* Su video fue aprobado.
* Su video fue rechazado.
* Su resultado fue registrado.
* Su pago de video extra fue aprobado.
* Su pago de video extra fue rechazado.
* Se habilitó un nuevo intento.

## Administrador

Recibir email cuando:

* Un usuario solicita inscripción.
* Un usuario envía comprobante de inscripción.
* Un usuario solicita video extra.
* Un usuario envía comprobante de video extra.
* Un nuevo video está pendiente de revisión.

---

# 32. Centro de notificaciones

Además del email, se puede incluir dentro de la aplicación:

```text
🔔 NOTIFICACIONES

● Tu inscripción fue aprobada.
  Hace 10 minutos.

● Tu video de Semana 1 fue aprobado.
  Hace 2 horas.

● Tu video extra fue aprobado.
  Ayer.
```

Esto permitirá que el usuario tenga un historial de las comunicaciones importantes.

---

# 33. Torneo cerrado por fechas

El sistema debe controlar automáticamente las fechas.

Ejemplo:

```text
SEMANA 1

Inicio:
Lunes 00:00

Fin:
Domingo 23:59
```

Después:

```text
SEMANA 1
🔒 Cerrada

SEMANA 2
🔥 Activa
```

Cuando termina una semana:

* No se permiten nuevos videos.
* No se permiten nuevos videos extra.
* El administrador puede terminar las revisiones pendientes según las reglas definidas.
* Se conserva el resultado final.
* Se habilita la siguiente semana.

---

# 34. Panel administrativo

El administrador tendrá un dashboard.

```text
ADMIN

┌─────────────────────────────┐
│ Torneo Online               │
├─────────────────────────────┤
│                             │
│ 👥 Competidores       124   │
│                             │
│ 🟡 Inscripciones      8     │
│                             │
│ 🎥 Videos pendientes  12    │
│                             │
│ 💰 Pagos pendientes   5     │
│                             │
│ 🏆 Semana activa      2     │
│                             │
└─────────────────────────────┘
```

---

# 35. Menú administrativo

```text
Dashboard

Torneo
├── Información
├── Configuración
├── Semanas
└── Retos

Competidores
├── Todos
├── Pendientes
└── Aprobados

Videos
├── Pendientes
├── Aprobados
└── Rechazados

Pagos
├── Inscripciones
└── Videos extra

Clasificación

Notificaciones

Configuración
```

---

# 36. Base de datos

## Users

Gestionado mediante Supabase Auth.

```text
auth.users
```

## Profiles

```text
profiles
├── id
├── user_id
├── name
├── lastname
├── username
├── email
├── phone
├── photo
├── category
├── role
├── created_at
└── updated_at
```

Roles:

```text
admin
competitor
```

Categorías:

```text
female
male
```

---

# 37. Tournaments

```text
tournaments
├── id
├── name
├── description
├── registration_fee
├── extra_video_fee
├── start_date
├── end_date
├── status
├── created_at
└── updated_at
```

Ejemplo:

```text
registration_fee = 2500
extra_video_fee = 500
```

---

# 38. Tournament weeks

```text
tournament_weeks
├── id
├── tournament_id
├── week_number
├── title
├── description
├── start_date
├── end_date
├── status
└── created_at
```

Estados:

```text
upcoming
active
closed
```

---

# 39. Challenges

```text
challenges
├── id
├── week_id
├── name
├── description
├── rules
├── example_video_path
├── created_at
└── updated_at
```

---

# 40. Challenge exercises

```text
challenge_exercises
├── id
├── challenge_id
├── exercise
├── repetitions
├── order
├── penalty_seconds
└── created_at
```

Ejemplo:

```text
Muscle Up
10 reps
+5 segundos

Push Up
20 reps
+3 segundos
```

---

# 41. Registrations

```text
registrations
├── id
├── tournament_id
├── user_id
├── category
├── status
├── payment_status
├── payment_reference
├── payment_amount
├── payment_date
├── receipt_path
├── reviewed_by
├── reviewed_at
├── rejection_reason
└── created_at
```

Estados:

```text
pending_payment
pending_review
approved
rejected
```

---

# 42. Submissions

Cada video enviado será un intento.

```text
submissions
├── id
├── challenge_id
├── user_id
├── attempt_number
├── video_path
├── duration
├── file_size
├── status
├── raw_time
├── penalty_seconds
├── final_time
├── reviewed_by
├── reviewer_notes
├── reviewed_at
└── created_at
```

---

# 43. Extra video requests

Para controlar específicamente el pago del video extra:

```text
extra_video_requests
├── id
├── challenge_id
├── user_id
├── payment_amount
├── payment_reference
├── payment_date
├── receipt_path
├── status
├── reviewed_by
├── reviewed_at
├── rejection_reason
└── created_at
```

Estados:

```text
pending_review
approved
rejected
used
expired
```

---

# 44. Results

```text
results
├── id
├── challenge_id
├── user_id
├── submission_id
├── position
├── raw_time
├── penalty_seconds
├── final_time
├── points
└── created_at
```

El resultado apunta al video/intentó que produjo el resultado oficial.

---

# 45. Notifications

```text
notifications
├── id
├── user_id
├── type
├── title
├── message
├── read_at
└── created_at
```

Tipos posibles:

```text
registration_submitted
registration_approved
registration_rejected

challenge_published

video_submitted
video_approved
video_rejected

result_published

extra_video_requested
extra_video_approved
extra_video_rejected
```

---

# 46. Storage

Supabase Storage tendrá buckets separados cuando sea conveniente.

Ejemplo:

```text
videos/
    tournament-id/
        week-1/
            user-id/
                attempt-1.mp4
                attempt-2.mp4

receipts/
    registrations/
        user-id/
            receipt.jpg

receipts/
    extra-videos/
        user-id/
            receipt.jpg

profiles/
    user-id/
        profile.jpg
```

Los videos y comprobantes no deberían estar en buckets públicos si contienen información que no debe quedar expuesta.

---

# 47. Seguridad

Las reglas de acceso deben garantizar que:

## Competidor

Puede:

* Ver su propio perfil.
* Editar su propio perfil.
* Ver sus propios videos.
* Subir videos de retos en los que está inscrito.
* Ver la clasificación.
* Ver información pública del torneo.

No puede:

* Modificar resultados.
* Modificar puntos.
* Aprobar pagos.
* Ver comprobantes de otros usuarios.
* Acceder al panel administrativo.
* Modificar retos.

## Administrador

Puede gestionar:

* Usuarios.
* Inscripciones.
* Pagos.
* Videos.
* Retos.
* Resultados.
* Clasificaciones.

---

# 48. Arquitectura tecnológica

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

## Backend

* Next.js
* Supabase

## Base de datos

* PostgreSQL / Supabase

## Autenticación

* Supabase Auth

## Storage

* Supabase Storage

## Emails

Utilizar un proveedor de email transaccional.

El sistema deberá enviar emails automáticamente cuando ocurran eventos importantes.

## Deploy

* Vercel para Next.js.

---

# 49. Arquitectura general

```text
                         ┌──────────────────┐
                         │   COMPETIDOR 📱  │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │     Next.js      │
                         │   Web + API      │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
        Supabase Auth        PostgreSQL          Storage
              │                   │                   │
          Usuarios            Torneos              Videos
          Sesiones            Retos                Comprobantes
          Roles               Resultados           Fotos
                              Pagos
                                  │
                                  ▼
                         Email transaccional
                                  │
                       ┌──────────┴──────────┐
                       ▼                     ▼
                  Competidor             Admin
```

---

# 50. Flujo completo del torneo

```text
USUARIO
   │
   ▼
REGISTRO
   │
   ▼
PERFIL
   │
   ▼
INSCRIPCIÓN ₡2.500
   │
   ▼
SINPE
   │
   ▼
COMPROBANTE
   │
   ▼
ADMIN REVISA
   │
   ├── RECHAZADO
   │
   └── APROBADO
          │
          ▼
       TORNEO
          │
          ▼
     SEMANA 1
          │
          ▼
       RETO
          │
          ▼
    SUBIR VIDEO
          │
          ▼
    ADMIN REVISA
          │
          ├── RECHAZADO
          │
          └── APROBADO
                 │
                 ▼
             RESULTADO
                 │
                 ▼
               PUNTOS
                 │
                 ▼
             RANKING
                 │
                 ▼
             SEMANA 2
                 │
                 ▼
                ...
                 │
                 ▼
             SEMANA 4
                 │
                 ▼
        CLASIFICACIÓN FINAL
```

---

# 51. Flujo de video extra

```text
COMPETIDOR
    │
    ▼
Resultado actual
    │
    ▼
"Mejorar mi tiempo"
    │
    ▼
Costo ₡500
    │
    ▼
SINPE
    │
    ▼
Comprobante
    │
    ▼
Solicitud
    │
    ▼
ADMIN
    │
    ├── RECHAZAR
    │
    └── APROBAR
          │
          ▼
    Video extra habilitado
          │
          ▼
    Competidor sube video
          │
          ▼
    Admin revisa
          │
          ▼
    Nuevo resultado
          │
          ▼
    Comparar con mejor resultado
          │
          ▼
    Conservar mejor resultado válido
```

---

# 52. Reglas importantes

La aplicación debe controlar automáticamente:

* El competidor debe estar inscrito.
* La inscripción debe estar aprobada.
* La semana debe estar activa.
* El video debe corresponder al reto correcto.
* El video debe ser enviado antes del cierre.
* El video extra requiere pago aprobado.
* El video extra solamente puede utilizarse durante el período permitido.
* El resultado debe ser validado por un administrador.
* Solamente los resultados aprobados generan puntos.
* La clasificación debe utilizar los resultados oficiales.
* Los puntos deben acumularse entre las cuatro semanas.

---

# 53. MVP

La primera versión debe enfocarse en el ciclo principal.

## Fase 1

* Registro.
* Login.
* Roles.
* Perfil.

## Fase 2

* Creación del torneo.
* Inscripción.
* SINPE.
* Comprobante.
* Aprobación administrativa.
* Emails.

## Fase 3

* Semanas.
* Retos.
* Reglas.
* Penalizaciones.
* Video de ejemplo.

## Fase 4

* Subida de videos.
* Revisión.
* Aprobación/rechazo.
* Resultados.
* Puntos.

## Fase 5

* Clasificación semanal.
* Clasificación acumulada.
* Femenino/Masculino.

## Fase 6

* Video extra ₡500.
* SINPE.
* Aprobación administrativa.
* Nuevo intento.
* Mejor resultado.

## Fase 7

* Centro de notificaciones.
* Estadísticas.
* Mejoras de UX.
* Optimización de videos.

---

# 54. Resultado esperado

El objetivo es que el competidor no tenga que utilizar Telegram para participar.

El flujo completo debe suceder dentro de la aplicación:

```text
REGISTRO
   ↓
INSCRIPCIÓN
   ↓
SINPE
   ↓
APROBACIÓN
   ↓
RETO
   ↓
VIDEO
   ↓
REVISIÓN
   ↓
RESULTADO
   ↓
PUNTOS
   ↓
RANKING
   ↓
VIDEO EXTRA
   ↓
NUEVO RESULTADO
   ↓
SIGUIENTE SEMANA
   ↓
CLASIFICACIÓN FINAL
```

La aplicación será, por tanto, **la plataforma central del torneo**, mientras que SINPE funcionará inicialmente como mecanismo de pago manual y el administrador será quien valide las transacciones antes de habilitar las funcionalidades correspondientes.
