# Limitaciones conocidas y siguientes pasos

Lo que se aplazó a propósito, con su razón:

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

Con más tiempo: ampliar la cobertura E2E más allá de navegación, formularios y
alertas (deep linking, capturas de estados de error), y snapshots de regresión
visual en ambas plataformas.
