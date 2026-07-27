# Casa Maiz

App de React Native CLI, TypeScript de punta a punta.

Toda la experiencia de invitado (Home, Menu, Privacy, navegación, alertas,
avisos y gating de actualización) sale del contrato publicado del CMS Payload
(v1.1). Nada editorial está hardcodeado.

> **¿Vienes a evaluar esto?** [**Arquitectura y trade-offs**](docs/ARCHITECTURE.md) ·
> [**Setup**](docs/SETUP.md) · [**Pruebas**](docs/TESTING.md) ·
> [**Limitaciones**](docs/LIMITATIONS.md)

## Demo

<p align="center">
  <img src="docs/media/demo.gif" width="300" alt="Demo: los blocks de Home servidos por el CMS, la pestaña Menu, el documento legal de privacidad, el placeholder de reservas y el formulario del CMS" />
</p>

> ¿Prefieres video? [Ver el MP4](docs/media/demo.mp4)

## Las dos plataformas

Mismo contrato de contenido, chrome distinto a propósito. En iOS hay un
`UIVisualEffectView` real detrás del tab bar. En Android, superficies tonales
de Material y elevación.

| Home | Menu | Privacy | Reservas | Form del CMS | Dark |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ![iOS home](docs/media/ios-01-home.png) | ![iOS menu](docs/media/ios-02-menu.png) | ![iOS privacy](docs/media/ios-03-privacy.png) | ![iOS reservas](docs/media/ios-04-reservations.png) | ![iOS form](docs/media/ios-05-form.png) | ![iOS dark](docs/media/ios-06-home-dark.png) |
| ![Android home](docs/media/android-01-home.png) | ![Android menu](docs/media/android-02-menu.png) | ![Android privacy](docs/media/android-03-privacy.png) | ![Android reservas](docs/media/android-04-reservations.png) | ![Android form](docs/media/android-05-form.png) | ![Android dark](docs/media/android-06-home-dark.png) |

*Fila de arriba iOS, fila de abajo Android.*

La app abre en light por defecto. Los builds de debug traen un engrane arriba
a la derecha en la pestaña **Form (dev)** que cambia al esquema dark en el
momento, la única forma de verlo sin salir de la app. Los builds de release,
incluido el APK descargable, no tienen ni la pestaña ni el engrane.

## Cobertura de requisitos

Cada requisito central del assessment y dónde vive:

| # | Requisito | Dónde |
|---|---|---|
| 1 | Base con fronteras claras, base URL configurable | `src/core`, `src/data`, `src/presentation` ([mapa](docs/ARCHITECTURE.md)) |
| 2 | Cliente tipado del CMS: cuatro parámetros de contexto, `Platform.OS`, versión instalada, contrato 1.1, URLs de media, dedupe, respuestas obsoletas descartadas | `core/contract/deliveryContext.ts`, `core/transport/client.ts`, `data/remote/` |
| 3 | Block registry que renderiza todos los blocks vivos de Home y Menu; los desconocidos fallan seguro | `presentation/blocks/registry.tsx` |
| 4 | Bootstrap como configuración: navegación, promociones, feature flags, aviso operativo, update gate, alertas con placement, trigger, frecuencia, dismissal y targeting | `data/logic/`, `presentation/banners/` |
| 5 | Navegación desde `bootstrap.navigation`, un solo resolver de destinos, links externos validados, back nativo | `navigation/destinations/resolveDestination.ts`, `navigation/components/TabNavigator.tsx` |
| 6 | Loading, vacío, error con retry, pull-to-refresh, offline/stale, contrato no soportado, not found; `nextChangeAt` como expiración dura | `data/remote/cache.ts`, `presentation/ui/ContentStatus.tsx` |
| 7 | Media absoluta y relativa, aspect ratio respetado, texto alternativo | `data/remote/fetchers/media.ts`, `presentation/ui/CmsImage.tsx` |
| 8 | Safe areas, back por plataforma, áreas táctiles, dynamic type, dark mode, reduced motion, teclado | `presentation/theme/`, `presentation/ui/AppPressable.tsx` |
| 9 | Pruebas automatizadas de los seis casos exigidos; typecheck, lint y test en verde | 186 pruebas, 6 flows de Maestro ([Pruebas](docs/TESTING.md)) |

Los tres bonus están cubiertos. **Glass de iOS**
(`presentation/ui/GlassSurface.tsx`, condicionado a Reduce Transparency).
**Material propio de Android** (superficies tonales, elevación, ripple).
Y el bloque de trabajo avanzado: deep links `casamaiz://`, envío de formulario
mockeado, validación Zod en runtime, la política completa de frecuencia de
alertas (`always`, `once`, `session`, con cooldown y ventana de undo de 4
segundos), crash reporting con Sentry y source maps
([Observabilidad](docs/OBSERVABILITY.md)), y flows E2E con Maestro.

## El bonus, en pantalla

<p align="center">
  <img src="docs/media/bonus.gif" width="620" alt="iOS y Android lado a lado: contenido pasando bajo el tab bar traslúcido de iOS junto a la barra tonal de Android, un deep link casamaiz:// abriendo la pantalla de privacidad, y el envío mockeado del formulario del CMS" />
</p>

> [Ver el MP4](docs/media/bonus.mp4). iOS a la izquierda, Android a la derecha, mismo flujo.

| Glass iOS | Material Android | Deep link (iOS) | Deep link (Android) | Form mockeado (iOS) | Form mockeado (Android) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| ![Glass iOS](docs/media/ios-bonus-glass.png) | ![Material Android](docs/media/android-bonus-material.png) | ![Deep link iOS](docs/media/ios-bonus-deeplink.png) | ![Deep link Android](docs/media/android-bonus-deeplink.png) | ![Form iOS](docs/media/ios-bonus-form.png) | ![Form Android](docs/media/android-bonus-form.png) |

- **Glass iOS.** Un `UIVisualEffectView` real detrás del tab bar
  (`presentation/ui/GlassSurface.tsx`). El contenido se sigue leyendo mientras
  pasa por debajo, y con Reduce Transparency el efecto cae a una superficie
  opaca.
- **Material Android.** El mismo tab bar con superficies tonales y elevación en
  vez de blur, cards tonales y ripple al presionar.
- **Deep links.** `xcrun simctl openurl booted casamaiz://legal/privacy_policy`
  (y su equivalente en `adb`) pasa por el mismo resolver de destinos que usa el
  CMS, y aterriza en el documento legal traído de `/legal/privacy_policy`.
- **Envío de formulario mockeado.** El `formBlock` envía contra una frontera de
  red mockeada y pinta el `confirmationMessage` del CMS. No se escribe nada en
  la API compartida salvo que `ENABLE_LIVE_FORM_SUBMISSIONS=true`.

### Feature flags que apagan navegación

`bootstrap.featureFlags.enable_new_home` controla el destino de Reservas. Mismo
build, mismo CMS, flag apagado en local con
`FEATURE_FLAG_OVERRIDES=enable_new_home=false`.

El destino se descarta antes de construir el navegador, así que la pestaña
desaparece sin un solo condicional dentro de las pantallas
(`data/logic/featureFlags.ts`, `navigation/components/TabNavigator.tsx`).

| `enable_new_home: true` | `enable_new_home: false` |
|:---:|:---:|
| ![Tab bar con Reservas](docs/media/ios-flag-on.png) | ![Tab bar sin Reservas](docs/media/ios-flag-off.png) |

## Probarla sin compilar

[**Descargar el APK de Android**](https://github.com/sjunka/casa-de-maiz/releases/latest).
33 MB, arm64-v8a, JS incluido en el binario, apuntando al CMS publicado.

Va firmado con el debug keystore de React Native, así que Android avisará de un
desarrollador desconocido. Verificado en un dispositivo físico (Redmi Note 8
Pro) el 2026-07-26.

```sh
adb install casa-maiz-1.0.0-arm64.apk
```

## Arranque rápido

Node 22, Xcode 26.5+ o Android Studio con un JDK 17.

```sh
cp .env.example .env          # API_BASE_URL ya apunta al deployment publicado
npm install
```

**iOS** (CocoaPods una vez, luego correr):

```sh
bundle install && (cd ios && bundle exec pod install)
npm run ios
```

**Android** (el emulador ya debe estar corriendo):

```sh
npm run android
```

Cualquiera de los dos compila un build de debug y lo levanta contra el dev
server de Metro. Eso es lo que ve un evaluador por defecto.

Para un build de release con el JS empaquetado, mira el
[APK precompilado](docs/SETUP.md#apk-precompilado-de-android). Dispositivos
físicos, red del emulador y deep links están en [Setup](docs/SETUP.md).

## Calidad

```sh
npm run typecheck && npm run lint && npm test
```

186 pruebas en 46 suites, más 6 flows end-to-end de Maestro que cubren
fallback offline, contenido expirado, versión de contrato no soportada,
navegación, una alerta publicada por el CMS y un envío de formulario. Detalle
en [Pruebas](docs/TESTING.md).

## Limitaciones conocidas

Lo que quedó fuera a propósito y por qué: cinco tipos de block que el contrato
declara pero de los que nunca publica una forma, una pantalla de Reservas sin
API detrás, instrumentación de performance que se queda en la frontera de
medición, y ninguna pasada con lector de pantalla.

Todo eso, con el razonamiento y qué mejoraría con más tiempo, en
[**Limitaciones conocidas y siguientes pasos**](docs/LIMITATIONS.md).

## Documentación

- [Arquitectura, trade-offs, dependencias y estrategia de tipos](docs/ARCHITECTURE.md)
- [Setup: prerrequisitos, configuración, comandos, deep links](docs/SETUP.md)
- [Calidad y pruebas](docs/TESTING.md)
- [Profiling y accesibilidad](docs/PROFILING.md), con números medidos de arranque, scroll y áreas táctiles
- [Observabilidad en producción](docs/OBSERVABILITY.md)
- [Limitaciones conocidas y siguientes pasos](docs/LIMITATIONS.md)
