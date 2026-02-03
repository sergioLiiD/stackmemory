# Guía de Publicación a NPM - StackMemory CLI

Este documento detalla los pasos para actualizar y publicar una nueva versión del CLI de StackMemory en NPM.

## 1. Prerrequisitos

Asegúrate de estar logueado en npm en tu terminal.

```bash
npm whoami
```

Si da error o no sale tu usuario:

```bash
npm login
```

## 2. Preparación

El código del CLI vive en `packages/cli`. Debes moverte a ese directorio antes de hacer nada.

```bash
cd packages/cli
```

## 3. Actualizar Versión

Debes subir la versión en `package.json`. Puedes hacerlo manualmente editando el archivo o usando el comando `npm version`.

**Opciones de versión:**

- **patch** (`0.0.6` -> `0.0.7`): Bug fixes, cambios pequeños (Lo más común).
- **minor** (`0.0.6` -> `0.1.0`): Nuevas features (retro-compatibles).
- **major** (`0.0.6` -> `1.0.0`): Cambios grandes que rompen compatibilidad.

**Comando automático:**

```bash
# Para un fix pequeño (ej. el cambio de 'ask')
npm version patch

# Para features nuevas
npm version minor
```

Esto actualizará el `package.json` y creará un git tag automáticamente (si estás en un repo git).

## 4. Publicar

Una vez actualizada la versión, sube el paquete al registro de NPM.

```bash
npm publish --access public
```

*(Nota: `--access public` es importante si es la primera vez o si es una organización, para asegurar que sea visible públicamente).*

## 5. Verificación

Espera unos segundos y verifica que la nueva versión esté disponible:

1. **En NPM:** [https://www.npmjs.com/package/stackmemory](https://www.npmjs.com/package/stackmemory)
2. **En terminal:**

    ```bash
    npm view stackmemory version
    ```

## 6. Probar la actualización (Usuario Final)

Para probar que la actualización funciona para los usuarios:

```bash
# Limpiar caché de npx (opcional pero recomendado si no se actualiza)
npx clear-npx-cache

# Ejecutar la última versión (npx busca la última por defecto)
npx stackmemory --version
```

---

## Resumen Rápido (Cheat Sheet)

```bash
cd packages/cli
npm version patch
npm publish --access public
cd ../..
```
