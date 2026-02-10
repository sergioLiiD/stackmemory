# StackMemory 🧠

**StackMemory** es una plataforma inteligente para gestionar tus proyectos de desarrollo, documentar tu stack tecnológico, y —lo más importante— **chatear con tu propio código**.

![Dashboard Preview](public/preview.png)

## 🚀 Características Principales

### 1. Gestión de Proyectos

* **Inventario de Stacks**: Registra qué tecnologías usas (Next.js, Supabase, Tailwind, etc.) y en qué versiones.
* **Service Locker**: Guarda enlaces a tus servicios (AWS, Vercel, Stripe) para no perder nunca el acceso.
* **Metadata**: Controla URLs de repositorios, despliegues y cuentas asociadas.

### 2. Vibe Coder (AI Assistant) 🤖

Conecta tu repositorio de GitHub y obtén un asistente experto en TU código.

* **Indexado Semántico**: Sincroniza tu repo para generar vectores de búsqueda (Embeddings).
* **Chat Inteligente**: Pregunta cosas como *"¿Dónde está la lógica de auth?"* o *"Explícame este componente"* y obtén respuestas precisas con citas a los archivos reales.
* **Context-Aware**: El crawler prioriza `README.md` y documentación para entender el propósito de tu proyecto.

### 3. Admin & Monitoring 🛡️

Panel de control para el dueño de la plataforma.

* **Control de Costos**: Monitorea cada centavo gastado en OpenAI (Embeddings + Chat).
* **Logs en Vivo**: Ve qué están haciendo los usuarios en tiempo real.
* **Gestión de Clientes**: Lista de usuarios, tiers, y su Customer Lifetime Value (LTV).

## 🛠️ Stack Tecnológico

* **Frontend**: Next.js 14 (App Router), TailwindCSS, Framer Motion.
* **Backend**: Next.js API Routes (Edge & Node).
* **Base de Datos**: Supabase (PostgreSQL).
* **IA & Vectores**:
  * `pgvector` (Supabase) para almacenamiento vectorial.
  * `text-embedding-ada-002` para embeddings.
  * `gpt-4o-mini` para generación de chat (RAG).
  * `Gemini 3.0 Flash` para análisis multimodal y onboarding.

## 📦 Instalación

1. **Clonar el repositorio**:

    ```bash
    git clone https://github.com/tu-usuario/stackmemory.git
    cd stackmemory
    ```

2. **Instalar dependencias**:

    ```bash
    npm install
    ```

3. **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` con:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    OPENAI_API_KEY=...
    ```

4. **Iniciar Desarrollo**:

    ```bash
    npm run dev
    ```

## 🔐 Configuración de Admin

Para acceder al panel `/admin`:

1. Regístrate en la app.
2. Ve a tu tabla `profiles` en Supabase.
3. Establece `is_admin` = `TRUE` en tu usuario.

---
Hecho con 💜 por Sergio.
