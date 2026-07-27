# Setup

Prerrequisitos, configuración, instalación, comandos y deep links para ambas
plataformas.

## Prerrequisitos

- Node 22.23.1, fijado en `.nvmrc`. Con `nvm`, corre `nvm use`.
- Xcode 26.5+ y CocoaPods 1.16+ para iOS.
- Android Studio (SDK, platform-tools, una imagen de emulador) y un JDK 17.
  `JAVA_HOME` debe apuntar a un JDK 17 (por ejemplo `brew install openjdk@17`).
- Ruby y Bundler para CocoaPods (`bundle install`).
- [Maestro CLI](https://maestro.mobile.dev) para la suite E2E:
  `curl -Ls "https://get.maestro.mobile.dev" | bash`.

## Configuración

La base URL se lee con `react-native-config` y nunca va hardcodeada.

```sh
cp .env.example .env
```

`.env.example` deja `API_BASE_URL` apuntando al deployment publicado. `.env`
está en `.gitignore`: no se commitea ningún secreto ni valor local.

El crash reporting (`SENTRY_DSN`, `SENTRY_ENVIRONMENT`) se configura igual.
`SENTRY_DSN` viene vacío, lo que mantiene el reporte apagado en local. Ponle un
DSN real para encenderlo.

### Red según el destino

- **Simulador de iOS**: llega a la API pública por `https` directo. No hace
  falta nada más que la base URL.
- **Emulador de Android**: su red virtual también llega por `https` directo. No
  se necesita mapear el host. Solo un servidor local de la máquina, en
  `10.0.2.2`, requeriría un caso especial, y aquí no aplica.
- **Dispositivo físico**: igual que el emulador, porque la base URL es un
  endpoint público. En iOS hay que registrar el dispositivo en un signing team
  desde Xcode. En Android hay que habilitar USB debugging y autorizar el
  dispositivo (`adb devices` debe listarlo).
  - Habilitar USB debugging: Ajustes, Acerca del teléfono, toca Número de
    compilación 7 veces para desbloquear Opciones de desarrollador, y activa
    Depuración USB.
  - Conecta por USB, acepta el diálogo "¿Permitir depuración USB?" en el
    dispositivo y confirma con `adb devices`. El estado debe decir `device`, no
    `unauthorized`.

## Instalación

```sh
npm install
bundle install                # una vez, para CocoaPods
(cd ios && bundle exec pod install)
```

## Correr

```sh
npm run ios       # Simulador de iOS
npm run android   # Emulador de Android, ya debe estar corriendo
```

En dispositivo físico:

```sh
npx react-native run-ios --device "Nombre de tu iPhone"
npm run android   # con un solo dispositivo autorizado en `adb devices`, sin flag
npx react-native run-android --device <adb-device-id>   # varios dispositivos o emuladores conectados
```

## APK precompilado de Android

Para probar la app sin toolchain, instala el APK del
[último release](https://github.com/sjunka/casa-de-maiz/releases/latest):

```sh
adb install casa-maiz-1.0.0-arm64.apk
```

Solo arm64-v8a, con el JS empaquetado en el binario y apuntando al CMS
publicado. Va firmado con el debug keystore de React Native, así que Android
avisa de un desarrollador desconocido.

Verificado instalando y corriendo en un dispositivo físico (Redmi Note 8 Pro)
el 2026-07-26. Para recompilarlo:

```sh
(cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a)
```

La subida de source maps de Sentry solo se engancha al build cuando
`SENTRY_AUTH_TOKEN` está definido, así que un build de release no necesita
credenciales. Ver [Observabilidad](OBSERVABILITY.md).

## Deep links

La app registra el scheme `casamaiz://`. Los destinos coinciden con los paths
publicados por el CMS, por ejemplo `casamaiz://menu`,
`casamaiz://legal/privacy_policy`, `casamaiz://reservas`.

```sh
# Simulador de iOS
xcrun simctl openurl booted casamaiz://menu

# Emulador o dispositivo Android
adb shell am start -W -a android.intent.action.VIEW -d "casamaiz://menu"
```

Un path no soportado aterriza en Home. Cualquier otro scheme se rechaza.
