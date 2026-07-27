# Calidad y pruebas

## Comandos

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
npm test            # jest, con React Native Testing Library y un AsyncStorage mockeado en memoria
```

Los tres pasan en `main`: cero errores de tipos, cero errores de lint y 186
pruebas en 46 suites en verde.

El renderer de rich text suprime `no-bitwise` de forma local
(`RichText.tsx`): los flags bitwise son el formato del propio Lexical. Lint
sale limpio, sin warnings.

Las pruebas verifican comportamiento observable por el usuario a través de
selectores estables (roles de accesibilidad, labels y test IDs), no detalles
internos de implementación.

## Cobertura exigida

El assessment nombra seis casos mínimos. Cada uno mapea a un archivo:

| Caso exigido | Cubierto por |
|---|---|
| Construcción del query context requerido | `__tests__/core/contract/deliveryContext.test.ts`, `appVersion.test.ts` |
| Validación de versión de contrato | `__tests__/core/contract/models/contractVersion.test.ts` |
| Un camino exitoso de render de blocks del CMS | `__tests__/presentation/screens/HomeScreen.test.tsx`, `presentation/blocks/BlockList.test.tsx` |
| Manejo de block desconocido | `__tests__/presentation/blocks/UnknownBlock.test.tsx` |
| Un escenario de cache, error o fallback offline | `__tests__/data/remote/cache.test.ts`, `core/transport/client.test.ts` |
| Un comportamiento derivado de bootstrap | `__tests__/data/logic/selectActiveAlert.test.ts`, `featureFlags.test.ts`, `decideAppUpdate.test.ts`, `navigation/TabNavigator.test.tsx` |

Más allá del mínimo: política de frecuencia de alertas, triggers por progreso
de scroll, resolución de destinos, deep linking, resolución de URLs de media,
envío de formulario, rich text, theming, reduced motion, reduce transparency y
crash reporting.

## Pruebas end-to-end

Cubren escenarios que dependen de navegación, persistencia y tiempo reales, no
de un `fetch` scripteado: fallback offline, contenido expirado, versión de
contrato no soportada, navegación por tabs, una alerta publicada por el CMS y
un envío de formulario.

Corren con Maestro contra un servidor de contenido mockeado local.

```sh
npm run e2e:mock-server    # terminal 1: API de contenido mockeada en :4001

npm run e2e:build:ios      # terminal 2: compila y levanta apuntando al mock (una vez por cambio)
npm run e2e:ios            # corre los flows contra el simulador de iOS

npm run e2e:build:android  # el emulador de Android ya debe estar corriendo
npm run e2e:android
```

Los flows viven en `e2e/flows/`. Los archivos `.js` de ese directorio manejan
el estado del mock server (un endpoint de home que falla, un `nextChangeAt`
casi vencido, una versión de contrato no soportada, una alerta de top bar) para
que cada flow arranque desde una condición conocida.

## Verificaciones de accesibilidad

Los elementos interactivos exponen rol, label, estado y un área táctil mínima a
través de `AppPressable`
(`__tests__/presentation/ui/AppPressable.test.tsx`).

Dynamic type, dark mode, Reduce Motion y Reduce Transparency tienen cada uno su
hook con prueba propia bajo `__tests__/presentation/theme/`.

Los resultados medidos (labels del árbol de accesibilidad, tamaños de área
táctil y ambas plataformas en su tipografía más grande) están en
[Profiling y accesibilidad](PROFILING.md), incluyendo dos hallazgos que las
pruebas no detectan.
