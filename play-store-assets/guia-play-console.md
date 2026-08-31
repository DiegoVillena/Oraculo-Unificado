# Guía para publicar en Google Play — Oráculo Unificado

Esta guía es para lo que **solo puedes hacer tú** (requiere tu cuenta y tus pagos). Todo lo demás (build, icono, capturas, textos, política de privacidad) ya está preparado en `play-store-assets/`.

Archivos ya listos:
- **APK/Bundle**: `android/app/build/outputs/bundle/release/app-release.aab` (este es el archivo que se sube, el `.aab`).
- **Icono 512×512**: `play-store-assets/icono-512.png`
- **Capturas de pantalla**: `play-store-assets/screens/` (02 a 06)
- **Textos de la ficha**: `play-store-assets/listing-textos.md`
- **Política de privacidad**: rama `gh-pages` del repo (activa Pages para obtener la URL, ver paso 0).

---

## Paso 0 (importante, una sola vez): activar GitHub Pages para la política de privacidad

La política de privacidad ya está subida en la rama `gh-pages` del repo `DiegoVillena/Oraculo-Unificado`. Ahora hay que activar Pages para que tenga URL pública:

1. Entra en **github.com/DiegoVillena/Oraculo-Unificado → Settings → Pages**.
2. En "Source" elige **Deploy from a branch**.
3. Branch: **gh-pages**, carpeta **/ (root)** → Save.
4. Espera ~1 minuto. La URL de la política será:
   **`https://diegovillena.github.io/Oraculo-Unificado/privacy-policy.html`**
   (Compruébala abriéndola en el navegador antes de usarla en Play.)

---

## Paso 1: Crear la cuenta de desarrollador de Google Play

1. Entra en **play.google.com/console** → "Crear cuenta".
2. **Pago único de 25 USD** (tarjeta de crédito/débito). Es la única compra.
3. Completar los datos de desarrollador:
   - **Nombre de desarrollador**: el que quieras mostrar (ej. "Diego Villena").
   - **Nombre de contacto** y **correo electrónico**: un correo real al que tengas acceso (obligatorio; es donde te avisarán de revisiones).
   - **Sitio web**: puedes poner tu GitHub (https://github.com/DiegoVillena) o dejarlo vacío si no te lo pide como obligatorio.
4. **Verificación de identidad**: Google te pedirá verificar tu identidad (a veces con un documento y un vídeo corto). Sigue las instrucciones en pantalla. Puede tardar unos días.

---

## Paso 2: Crear la app y la ficha

1. En Play Console, botón **"Crear app"**.
   - **Nombre**: `Oráculo Unificado`
   - **Idioma**: Español (o el que prefieras como principal).
   - **App de juego**: No.
   - **Gratuita o de pago**: Gratuita.
   - Pulso **"Crear app"**.
2. En el menú de la izquierda, ve a **"Presencia en la tienda" → "Ficha de la tienda"** y rellena:
   - **Nombre**: `Oráculo Unificado`
   - **Descripción corta**: copia de `listing-textos.md` (Español).
   - **Descripción completa**: copia de `listing-textos.md` (Español).
   - **Categoría**: `Lifestyle` (la más común en tarot/astrología).
   - **Añadir idioma**: añade **English** y pega las descripciones en inglés.
   - **Icono de la app**: sube `play-store-assets/icono-512.png`.
   - **Capturas de pantalla**: sube las de `play-store-assets/screens/` (02_main, 03_tarot, 04_astral_form, 05_astral_result, 06_sinastria). Sube al menos 2 de teléfono.

---

## Paso 3: Política de privacidad

En la ficha de la tienda, hay un campo **"Política de privacidad"**. Pega la URL del **Paso 0**:
`https://diegovillena.github.io/Oraculo-Unificado/privacy-policy.html`

---

## Paso 4: Subir el bundle (la versión)

1. En el menú izquierdo: **"Versión de producción" → "Crear versión"**.
2. **Activar Google Play App Signing**: Play te propondrá activar su firma de apps. Acepta. **Importante**: conserva el archivo `android/app/oraculo-release.keystore` y su contraseña (`oraculo123`) en un lugar seguro fuera de la app. Si los pierdes, no podrás actualizar la app en el futuro.
3. Arrastra el archivo **`android/app/build/outputs/bundle/release/app-release.aab`**.
4. Revisa que no haya errores, rellena el campo de "Novedades" (ej. "Primera versión de la app"), y pulsa **"Guardar"** y luego **"Revisar versión"**.

---

## Paso 5: Cuestionario de "Seguridad de los datos" (Data safety)

En el menú: **"Presencia en la tienda" → "Seguridad de los datos"**. Responde así (coherente con la política de privacidad):

**¿Recoge o comparte la app datos?** → **Sí** (porque la carta astral usa datos de nacimiento y el análisis IA los envía a Gemini).

En **"Datos"**, declara:
- **Información personal**: sí. Tipo: "Nombre y apellidos" (opcional, al guardar una carta) y "Fecha de nacimiento" (obligatoria para la carta astral).
- **Actividad en la app**: no es obligatorio declarar.
- Marca los datos como **"Se recopilan en el dispositivo"** y para la fecha de nacimiento también **"Se envían a servidores"** (por el análisis IA).
- **¿Se comparten con terceros?**: Sí, la fecha de nacimiento se comparte con un proveedor de IA (Gemini vía Cloudflare) para generar el análisis.
- **Cifrado**: todos los datos se transmiten cifrados (HTTPS) → marca "Sí".
- **Eliminación de datos**: sí, el usuario puede borrar sus cartas desde la app.
- **¿Los datos se usan para fines publicitarios?**: No.
- **¿Hay una política de privacidad?**: Sí (la URL del Paso 0).

---

## Paso 6: Cuestionario de "Clasificación de contenido" (Content rating)

En el menú: **"Presencia en la tienda" → "Clasificación de contenido"**. Son unas 20 preguntas tipo test sobre contenido.

Respuestas recomendadas para esta app:
- **Temas de referencia**: marca "No contiene..." o lo mínimo. La app trata temas de astrología/esoterismo y amor/relaciones.
- En la sección **"Sugerencia de contenido"** (violencia, sexo, etc.): responde **"No" / "Ninguna"** en casi todo. No hay violencia, ni sangre, ni lenguaje soez, ni sexo gráfico, ni juego con apuestas.
- El resultado esperado será **"PEGI 3"** o **"Todas las edades"** (o a lo sumo "PEGI 7" por temas de relaciones). Eso es correcto para esta app.
- Revisa las respuestas y pulsa **"Enviar"** / guardar.

---

## Paso 7: Público objetivo y contenido IA

- **Público objetivo** (menú "Presencia en la tienda" → "Público objetivo"): app dirigida a **todos**, **no enfocada a menores** (mayores de 13 años). La app no está diseñada para niños.
- **Contenido generado por IA** (si Play te lo pregunta en la ficha o en el cuestionario de datos): declara **"Sí"**, la app usa IA (Gemini) para generar interpretaciones, y que ese contenido está **revisado/limitado** para no generar contenido dañino o engañoso.

---

## Paso 8: Enviar para revisión

1. Revisa el panel de la izquierda: deben estar todos los puntos **verdes** (ficha completa, versión subida, clasificación hecha, seguridad de datos hecha).
2. En la página de la **versión de producción**, pulsa **"Revisar versión"** y luego **"Iniciar lanzamiento de producción"** (o "Enviar para revisión").
3. Google revisará la app (normalmente **unas horas a 2-3 días**). Te llegará un correo con el resultado.

---

## Notas importantes

- **Enlace Ko-fi**: lo dejaste activo. Es el punto con más probabilidad de que Play pida cambios en la revisión (política de pagos externos). Si la app es rechazada por esto, la solución es quitar el enlace en una futura versión.
- **Nunca pierdas el keystore** (`oraculo-release.keystore`) ni sus contraseñas. Guárdalos en un lugar seguro.
- **Para futuras actualizaciones**: sube el nuevo `.aab` en "Versión de producción" y aumenta el `versionCode` en `android/app/build.gradle`.
