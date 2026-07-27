# Profiling y accesibilidad

Mediciones, no afirmaciones. Todo lo de abajo se capturó el 26 de julio de 2026
contra el build de release y el CMS vivo, con los comandos a la vista para que
se pueda repetir.

**Equipo:** en Android, el APK de release (`arm64-v8a`, JS empaquetado) sobre
un emulador tipo Pixel (`neotox`, 1080×2400, 420 dpi, Android 16). En iOS, el
simulador de iPhone 17 Pro con iOS 26.2.

Los dos son hardware emulado, así que trata los números como relativos y no
como propios de un dispositivo. Un simulador no modela throttling térmico,
límites reales de GPU ni un page cache frío.

## Arranque

Cold launch hasta el primer frame, con `adb shell am start -W` y la app forzada
a cerrar entre corridas:

```sh
adb shell am force-stop com.casamaiz
adb shell am start -W -n com.casamaiz/.MainActivity
```

| Corrida | 1 | 2 | 3 | 4 | 5 | Mediana |
|---|---|---|---|---|---|---|
| TotalTime (ms) | 349 | 220 | 234 | 320 | 235 | **235** |

Eso es arranque hasta el primer frame, que es el estado de loading, no
contenido. El tiempo hasta el primer contenido es eso más el viaje al CMS,
medido aparte abajo, porque la app no tiene instrumentación de arranque que
reporte un solo número de punta a punta.

Agregarla (un `os_signpost` en iOS, una trace section en Android, disparada
cuando se renderiza el primer block) es el siguiente paso obvio, y es
justamente lo que la [frontera de repositorio y query](ARCHITECTURE.md) existe
para facilitar.

## Latencia del CMS

Tres corridas por endpoint desde la máquina de desarrollo, con los parámetros
de delivery context requeridos:

```sh
curl -s -o /dev/null -w "ttfb=%{time_starttransfer}s total=%{time_total}s size=%{size_download}B\n" \
  "$BASE/api/content/v1/bootstrap?platform=android&market=MX&audience=guest&appVersion=1.0.0"
```

| Endpoint | TTFB (mejor a peor) | Payload |
|---|---|---|
| `/bootstrap` | 0.32 a 0.55 s | 12.1 KB |
| `/pages/home` | 0.31 a 0.40 s | 20.7 KB |
| `/pages/menu` | 0.32 a 0.51 s | 19.1 KB |
| `/legal/privacy_policy` | 0.31 a 0.34 s | 1.0 KB |

La primera petición de cada corrida es siempre la más lenta, que es el
deployment de Vercel despertando y no algo de la app.

Consecuencia práctica: el primer contenido aterriza entre 0.5 y 0.9 s después
del arranque con red tibia, y la respuesta guardada es lo que cubre el caso
frío u offline.

## Performance de scroll

`dumpsys gfxinfo` reseteado justo antes de cada interacción y leído justo
después. El presupuesto de frame es 16.7 ms a 60 Hz.

```sh
adb shell dumpsys gfxinfo com.casamaiz reset
# ...interactuar...
adb shell dumpsys gfxinfo com.casamaiz
```

| Superficie | Frames | Janky | p50 | p90 | p95 | p99 |
|---|---|---|---|---|---|---|
| Home, vertical (18 swipes) | 833 | 4.2% | 17 ms | 18 ms | 22 ms | 26 ms |
| Menu, vertical (10 swipes) | 372 | 5.4% | 17 ms | 17 ms | 18 ms | 19 ms |
| Carousel, paginado horizontal (10 swipes) | 291 | 7.2% | 17 ms | 17 ms | 18 ms | 23 ms |

Ninguna corrida perdió vsyncs ni reportó subidas lentas de bitmaps, que es la
señal que importa vigilar con contenido tan cargado de imágenes. El p99 de Home
(26 ms) sale de los frames donde entran cards nuevas con imagen.

Una medición para descartar en vez de creer: el swipe horizontal en el promo
rail reportó 50% de frames janky sobre una muestra de **16 frames**. El rail
hoy tiene una sola card, así que no había nada que scrollear y la muestra es
ruido en reposo.

Queda anotado porque un 50% sin el tamaño de muestra al lado es exactamente el
tipo de número que se repite fuera de contexto.

## Memoria y tamaño

Después del arranque más las corridas de scroll de arriba
(`adb shell dumpsys meminfo`):

| Métrica | Valor |
|---|---|
| Total PSS | 253 MB |
| Total RSS | 353 MB |
| Native heap | 154 MB |
| Dalvik heap | 9 MB |
| APK de release (arm64-v8a) | 32.0 MB |
| Bundle JS de release en iOS | 5.3 MB |

El native heap domina, que es lo esperado con Hermes más los buffers de
decodificación de imágenes.

## Accesibilidad

### Labels y áreas táctiles

El árbol de accesibilidad de Android se volcó con
`adb exec-out uiautomator dump` en Home, y se midió cada nodo clickeable (a 420
dpi, 1 dp = 2.625 px):

| Control | Antes | Después |
|---|---|---|
| Ítems del tab bar | 82 a 103 × 52 dp | sin cambio, ya pasaba ambos mínimos |
| Acciones de aviso ("Ir a menú") | 36 dp de alto | **48 dp** |
| Anterior y siguiente del carousel | 44 × 44 dp | **48 × 48 dp** en Android, 44 en iOS |
| Cerrar aviso | 20 dp visuales + `hitSlop={12}` = 44 dp | 20 dp visuales + `hitSlop` = **48 dp** en Android, 44 en iOS |

Todos los nodos clickeables tienen label de accesibilidad. No faltaba ninguno.

La revisión original encontró tres controles dimensionados al mínimo de 44 pt
de iOS en ambas plataformas, donde Material pide 48 dp, y pills de acción de
aviso en apenas 36 dp.

Ahora todos resuelven contra un solo token `MIN_TOUCH_TARGET`
(`src/presentation/theme/tokens.ts`) que devuelve 48 en Android y 44 en iOS,
junto al resto de divergencias por plataforma.

Ojo con una cosa: `uiautomator` reporta límites visuales y no ve el `hitSlop`
de React Native, así que el botón de cerrar sigue leyéndose como 20 dp en un
volcado crudo.

Su área efectiva se verifica en
`__tests__/presentation/banners/noticeTouchTarget.test.tsx`, que es el único
lugar donde el tamaño del glifo y el slop se revisan juntos.

### Texto grande

Android se probó con `settings put system font_scale 1.3` y `2.0`. iOS con
`simctl ui booted content_size accessibility-extra-extra-extra-large`.

A 2.0× en Android todo refluye: el texto del aviso pasa a tres líneas, títulos
y descripciones de cards crecen, los precios siguen visibles y nada se corta ni
se encima. El tab bar mantiene su layout de solo íconos, que es justamente por
qué no tiene labels que desborden.

La revisión original encontró que el stack de avisos se comía la pantalla a
esos tamaños. Con tres avisos activos (actualización de app, aviso operativo y
alerta) ocupaba como media pantalla a 2.0× en Android y la llenaba entera en el
tamaño `accessibility-extra-extra-extra-large` de iOS, dejando Home alcanzable
solo después de descartarlos.

Los tres avisos ahora comparten un contenedor
(`src/presentation/banners/NoticeStack.tsx`) topado al 40% de la pantalla, que
a partir de ahí scrollea por dentro.

Se volvió a revisar en ambos ajustes: el contenido de Home y el tab bar siguen
alcanzables, el stack scrollea para mostrar el resto, y a tamaños de texto por
defecto no cambia nada.

### Qué no se probó

Ninguna pasada con lector de pantalla. TalkBack y VoiceOver no se pueden
manejar desde la línea de comandos, y leer labels del árbol de accesibilidad
(que es lo que se hizo arriba) no es lo mismo que confirmar el orden de anuncio
y el movimiento de foco que produce un lector real.

Eso requiere una pasada manual en dispositivo y es lo primero que haría con más
tiempo.
