# Blank UI

Editor local de componentes React, con un botón nativo como base. Permite editar estilos por tema y estado, modificar TSX/CSS reales y ejecutar una vista previa aislada.

## Ejecutar

```sh
npm install
npm run dev
```

Se necesita Node.js 22.18 o posterior. Los comandos `dev` y `build` generan los recursos locales de Monaco; el editor no depende de un CDN. Monaco se compila desde sus fuentes para incluir la versión corregida de DOMPurify.

## Verificar

```sh
npm run typecheck
npx playwright install chromium
npm test
npm run build
npm audit
```

Las pruebas usan el puerto 3001 y una carpeta de compilación independiente. La aplicación normal usa el puerto 3000.

## Funcionamiento

- El documento (nombre, TSX, CSS y modelo visual) se guarda en `localStorage` de este navegador. “Saved locally” aparece solo después de guardar; un fallo de almacenamiento se muestra explícitamente.
- `Export files` descarga un ZIP con `Button.tsx` y `styles.css`. Se usan juntos en un proyecto React con soporte de CSS.
- El TSX se compila con esbuild en `/api/preview`, sin ejecutarse en el servidor. Se ejecuta en un iframe con origen aislado, sin acceso al almacenamiento del editor, y con solicitudes de red bloqueadas.
- La vista previa admite imports de React y `./styles.css`, y una exportación `Button` o una exportación por defecto. Las dependencias externas muestran un error de compilación.
- Los estilos visuales se guardan entre los marcadores `blank:generated`, dentro de una capa CSS. Las reglas personalizadas fuera de esa capa tienen prioridad y se conservan.
- El botón comparte geometría, tipografía y valores de interacción entre claro y oscuro. Cada estado hereda Default y solo aplica sus ajustes explícitos; los colores de fondo, texto y borde son propios de cada tema. Los cambios visuales, las ediciones de CSS gestionado y los restablecimientos mantienen esta base compartida.
- Al abrir documentos anteriores, se unifican los valores estructurales guardados: se conserva el valor personalizado de oscuro, o el de claro cuando oscuro no tiene uno. Si ambos tienen valores distintos, prevalece oscuro. El CSS personalizado se conserva.
- La edición directa de propiedades gestionadas (colores, valores numéricos en px, transformaciones y sombras generadas) actualiza el modelo visual. Los valores gestionados se sincronizan entre las reglas del tema del sistema y las del tema explícito.
- CSS arbitrario se aplica en la vista previa, pero no se convierte íntegramente a controles visuales. Las expresiones, selectores y propiedades ajenas al modelo siguen editándose en código. Los controles muestran valores iniciales de edición para propiedades sin personalizar; el botón conserva el estilo nativo del navegador hasta modificarlas.
- El campo Label actualiza el valor literal predeterminado de `children` en el TSX. Si el contenido se define de otra forma, se edita en código.
- `Reset component` tiene una acción para deshacer. Los cambios CSS y de tema conservan el estado React del componente; recompilar TSX o cambiar entre espacios de trabajo reinicia la instancia de vista previa.

## Alcance actual

Solo está implementada la primitiva Button y un documento local. Publicación, cuentas, biblioteca de múltiples componentes, registry, forks y colaboración no tienen backend. Sus accesos no operativos se muestran deshabilitados. La compilación de vista previa está pensada para desarrollo local; un despliegue público requiere controles de acceso y límites de recursos propios.
