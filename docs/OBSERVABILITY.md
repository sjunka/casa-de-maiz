# Observabilidad en producción

## Crashes

`@sentry/react-native` se inicializa en la raíz de la app
(`src/observability/crashReporting.ts`, conectado en `App.tsx`) y reporta
crashes nativos y de JS con la versión instalada y la plataforma adjuntas.

Ambos datos salen de los módulos que ya son fuente única
(`src/core/contract/appVersion.ts`, `src/core/contract/deliveryContext.ts`).
Viene apagado por defecto: `SENTRY_DSN` está vacío en `.env.example`, ver
[Setup](SETUP.md).

## Source maps

Los builds de release suben los source maps de JS a Sentry solos. Android con
`apply from: "sentry.gradle"` en `android/app/build.gradle`, que envuelve la
tarea de bundle. iOS con el wrapper `sentry-xcode.sh` sobre la fase "Bundle
React Native code and images".

Los dos leen org y proyecto de `ios/sentry.properties` y
`android/sentry.properties` (hoy placeholders, hay que poner los slugs reales)
y el token de subida de la variable de entorno `SENTRY_AUTH_TOKEN` en la
máquina de build, que nunca se commitea. Los builds de debug no suben nada.

Ambas plataformas solo enganchan la subida cuando `SENTRY_AUTH_TOKEN` está
definido: un `apply from:` condicional en `android/app/build.gradle`, y una
rama en la fase de bundle de iOS que cae al `react-native-xcode.sh` de fábrica.

Sin esa guarda, `sentry-cli` corre sin credenciales y sale con código distinto
de cero, lo que revienta el build entero. Ni `assembleRelease` ni un release de
iOS funcionarían para quien solo quiere un binario, como un evaluador o un CI
sin secretos.

## Fallos de contenido

Los fallos de transporte se mapean en la frontera
(`src/core/transport/client.ts`, `src/core/transport/apiError.ts`) a un mensaje
seguro para el usuario más contexto técnico retenido: endpoint, status y tipo
de error.

Nunca se guardan payloads completos, así que los logs de producción no pueden
filtrar contenido editorial ni PII. Todo eso se reenvía al mismo pipeline de
Sentry. Los blocks desconocidos o inválidos se registran como breadcrumbs que
llevan solo el tipo de block.

## Performance

No está construido. Las transiciones de pantalla y el tiempo hasta el primer
contenido se medirían en la frontera de fetch del CMS, que ya está aislada
detrás de la capa de repositorio y query.

Ese es un solo lugar donde cronometrar "time to first content" y "time to
interactive" sin instrumentar cada pantalla por separado.
