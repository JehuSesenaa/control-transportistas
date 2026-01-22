# Documentación Técnica - Control de Transportistas

## Decisiones de Diseño

### Arquitectura General
- **SPA (Single Page Application)** usando Angular 17 con módulos lazy-loaded para optimizar carga inicial
- **Patrón de estado reactivo** con RxJS/BehaviorSubject para gestión de datos en tiempo real
- **Separación clara** entre servicios (lógica de negocio), componentes (UI) y modelos (tipos de datos)

### Gestión de Estado
- **BehaviorSubject** para estado compartido entre componentes
- **Operadores RxJS** (`takeUntil`, `combineLatest`, `map`, `tap`) para manejo de observables
- **Destrucción automática** de suscripciones con `Subject<void>()` para prevenir memory leaks

### API Integration
- **Servicios especializados** por entidad (UsuarioService, UnidadService, RutaService, PerformanceService)
- **Manejo de errores consistente** con transformación de respuestas HTTP
- **Relaciones automáticas** entre entidades (ej: unidad asignada a ruta)

### UI/UX Decisions
- **Estilos personalizados** sin dependencias externas (Bootstrap/jQuery)
- **Dropdowns personalizados** con JavaScript vanilla para funcionalidad completa
- **Filtros inteligentes** con validación de tipos y manejo de estados vacíos
- **Responsive design** con media queries para dispositivos móviles

### Formularios
- **Reactive Forms** con validaciones condicionales basadas en modo (crear/editar)
- **Campos opcionales en edición** siguiendo principios REST (PATCH vs PUT)
- **Validaciones contextuales** que cambian según el flujo de usuario

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios compartidos
│   │   └── services/           # Lógica de negocio y API
│   │       ├── usuario.service.ts
│   │       ├── unidad.service.ts
│   │       ├── ruta.service.ts
│   │       └── performance.service.ts
│   │
│   ├── models/                  # Definiciones de tipos
│   │   ├── usuario.model.ts
│   │   ├── unidad.model.ts
│   │   ├── ruta.model.ts
│   │   └── performance.model.ts
│   │
│   ├── shared/                  # Componentes/utilidades compartidas
│   │
│   ├── [feature-modules]/       # Módulos lazy-loaded
│   │   ├── usuarios/
│   │   │   ├── usuario-list/
│   │   │   ├── usuario-form/
│   │   │   └── usuarios-routing.module.ts
│   │   ├── unidades/
│   │   ├── rutas/
│   │   └── performances/
│   │
│   ├── app-routing.module.ts    # Routing principal
│   ├── app.module.ts           # Módulo raíz
│   └── app.component.*         # Componente raíz
│
├── environments/               # Configuración por entorno
├── styles.css                  # Estilos globales
├── index.html                  # HTML principal
└── main.ts                     # Bootstrap de Angular
```

### Patrón de Organización por Feature
Cada módulo de feature sigue la estructura:
- **Componentes especializados** (list, form)
- **Routing propio** con lazy loading
- **Módulo feature** que agrupa componentes y dependencias
- **Servicios inyectados** a nivel de aplicación

### Convenciones de Nomenclatura
- **Componentes**: `feature-action` (ej: `usuario-list`, `ruta-form`)
- **Servicios**: `FeatureService` (ej: `UsuarioService`)
- **Modelos**: `feature.model.ts` con interfaces TypeScript
- **Archivos**: kebab-case para archivos, PascalCase para clases

### Gestión de Dependencias
- **Standalone components** inicialmente, luego convertidos a módulos
- **Imports tree-shakeable** para optimización de bundle
- **Inyección de dependencias** a través de constructores

Esta estructura permite escalabilidad, mantenibilidad y separación clara de responsabilidades.</content>
