# Control Transportistas

Aplicación Angular para la gestión de usuarios y unidades de transporte.

## Características

- **Módulo de Usuarios**: Gestión completa CRUD (Crear, Leer, Actualizar, Eliminar) de usuarios
- **Módulo de Unidades**: Gestión completa CRUD de unidades con asignación de usuarios

## Estructura del Proyecto

```
src/
├── app/
│   ├── models/          # Modelos de datos (Usuario, Unidad)
│   ├── services/        # Servicios para manejo de datos
│   ├── usuarios/        # Módulo de usuarios
│   │   ├── usuario-list/    # Lista de usuarios
│   │   └── usuario-form/    # Formulario de creación/edición
│   ├── unidades/        # Módulo de unidades
│   │   ├── unidad-list/     # Lista de unidades
│   │   └── unidad-form/     # Formulario de creación/edición
│   └── app.component.*  # Componente principal
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar la aplicación:
```bash
npm start
```

3. Abrir en el navegador:
```
http://localhost:4200
```

## Uso

### Módulo de Usuarios

- **Crear Usuario**: Navegar a Usuarios → "Nuevo Usuario"
- **Editar Usuario**: Hacer clic en "Editar" en la lista de usuarios
- **Eliminar Usuario**: Hacer clic en "Eliminar" en la lista de usuarios

### Módulo de Unidades

- **Crear Unidad**: Navegar a Unidades → "Nueva Unidad"
  - Debe seleccionar un usuario existente para asignar a la unidad
- **Editar Unidad**: Hacer clic en "Editar" en la lista de unidades
- **Eliminar Unidad**: Hacer clic en "Eliminar" en la lista de unidades

## Tecnologías

- Angular 17
- TypeScript
- RxJS
- Reactive Forms
- Routing con lazy loading

## Notas

- Los datos se almacenan en memoria (no hay backend)
- La aplicación incluye datos de ejemplo al iniciar
- Es necesario crear usuarios antes de asignarlos a unidades
