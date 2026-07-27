# Limitaciones conocidas y siguientes pasos

## Lo que quedó fuera a propósito

Con su razón:

- **Tipos generados de OpenAPI.** Descartados, no aplazados. Ver
  [Estrategia de tipos](ARCHITECTURE.md#estrategia-de-tipos).
- **Cinco tipos de block en un renderer best-effort.** `restaurantHero`, `cta`,
  `content`, `mediaBlock` y `archive` están declarados en el contrato OpenAPI,
  pero el contrato no publica la forma de sus campos. Ningún payload vivo de
  Home o Menu ha servido uno contra el cual verificar.

  Todos pasan por `GenericBlock`, que lee solo campos opcionales de nombre
  genérico (`heading`/`title`, `richText`/`content`, `media`/`image`,
  `link`/`href`, `label`) y no renderiza nada si no encuentra ninguno, en vez
  de adivinar un schema que nadie publicó.
- **Triggers de alerta más allá de `load` y `scrollPercent`.** Los dos están
  implementados. `scrollPercent` no está verificado contra contenido vivo: el
  CMS hoy solo publica un trigger `load`, así que el nombre del campo
  (`trigger.scrollPercent`) viene del contrato y está cubierto por pruebas, no
  por un payload real. Cualquier otro tipo de trigger cae al mismo camino de
  "no renderizar nada" que un placement no soportado.
- **Una librería de conectividad.** En su lugar, offline se deriva del fallo de
  la petición. Eso ya cubre el caso que una librería de conectividad no
  cubriría (red alcanzable, API caída) y evita una dependencia más.
- **Reservas.** Es una pantalla placeholder local. No hay API de reservas
  documentada para esta versión del contrato.
- **Instrumentación de performance.** La frontera de medición existe pero no
  está conectada a un backend de métricas. Ver
  [Observabilidad](OBSERVABILITY.md).

  Sin eso, el tiempo hasta el primer contenido solo se puede medir como tiempo
  de arranque más latencia del CMS, no como un número único. Las dos mitades
  están medidas en [Profiling](PROFILING.md).
- **Ninguna pasada con lector de pantalla.** Los labels y las áreas táctiles se
  verificaron desde el árbol de accesibilidad, que no es lo mismo que confirmar
  el orden de anuncio y el movimiento del foco con TalkBack y VoiceOver.
- **Universal Links y Android App Links.** Fuera de alcance: no hay un dominio
  cuya propiedad el assessment nos permita verificar. El scheme propio
  `casamaiz://` sí está implementado.

## Qué mejoraría con más tiempo

En este orden, por lo que cada cosa compra:

1. **Verificar las formas que hoy son suposiciones.** El `formBlock` está
   modelado sobre el plugin form-builder de Payload y los cinco block genéricos
   leen campos de nombre probable, porque ningún payload vivo sirve uno. Con un
   payload real o un schema de block en el OpenAPI, esos schemas dejan de ser
   una apuesta. Es lo
   único de esta lista que puede estar mal hoy en vez de solo faltar.
2. **Una pasada real de lector de pantalla.** VoiceOver y TalkBack sobre los
   cinco flujos, verificando orden de anuncio y movimiento del foco, no solo el
   árbol de accesibilidad.
3. **CI.** No hay pipeline: `typecheck`, `lint` y `test` corren a mano. Una
   GitHub Action con los tres más un build de debug por plataforma convierte la
   sección de Calidad en algo que un evaluador no tiene que ejecutar para
   creerse.
4. **Cerrar el lazo de performance.** La frontera de medición existe pero no
   reporta a ningún backend ([Observabilidad](OBSERVABILITY.md)), así que el
   tiempo hasta el primer contenido sigue siendo dos números sumados a mano.
   Conectarla convierte el profiling puntual de
   [Profiling](PROFILING.md) en una serie de tiempo.
5. **Ampliar E2E.** Hoy son 6 flows. Faltan deep linking, capturas de los
   estados de error y snapshots de regresión visual en ambas plataformas —
   justamente lo que las pruebas de componente no pueden probar.
6. **Sacar los strings locales de la app.** `noticeCardStrings` ("Aviso
   descartado", "Deshacer") es la única copy que la app se inventa, y está en
   español hardcodeado. O la publica el CMS, o entra en una capa de i18n; hoy no
   está en ninguna de las dos.
7. **Reservas y Universal Links.** Ambos esperan a algo externo: una API de
   reservas documentada y un dominio cuya propiedad podamos verificar. Ninguno
   es trabajo de app hasta entonces.
