# plano_llm

Chat web para el proyecto Plano, servido con Node.js y conectado a la API de OpenAI.

## Despliegue en Render

El archivo `render.yaml` define un servicio web Node en el plan gratuito. Para desplegarlo:

1. Conecta este repositorio en Render y crea un **Blueprint** usando `render.yaml`.
2. En la configuración del servicio, añade `OPENAI_API_KEY` como variable secreta. No la guardes en el repositorio.
3. Render instalará dependencias con `npm ci` e iniciará el servicio con `npm start`.
4. Abre la URL del servicio que Render proporciona.

`OPENAI_MODEL` está configurada como `gpt-5` en el Blueprint. Puedes cambiar ese valor en la configuración del servicio.

## Ejecución local

Requiere Node.js y npm. Instala las dependencias y configura las variables de entorno:

```sh
npm ci
cp .env.example .env
```

Añade tu clave real a `OPENAI_API_KEY` en `.env` y ejecuta:

```sh
npm start
```

Abre `http://localhost:3000`. La clave no debe incluirse en el cliente web ni publicarse en Git.
