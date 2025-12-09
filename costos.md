# Análisis de Costos de Modelos AI

Este documento detalla los costos asociados con el uso de la API de OpenAI para "StackMemory" (Vibe Coder).

## 1. El Cerebro (Embeddings)

**Modelo**: `text-embedding-ada-002`
Se usa para: Indexar el código del repositorio (sincronización).

| Concepto | Precio |
| :--- | :--- |
| **Input (Lectura)** | **$0.02** / 1,000,000 tokens |

### Ejemplo Práctico: Sincronización

Un repositorio mediano de Next.js suele tener unos **50 archivos** de código puro, con un promedio de 2,000 tokens por archivo.

* Total tokens: 100,000 tokens
* **Costo por Sync**: $0.002 (¡Menos de un centavo!)

---

## 2. La Boca (Chat / RAG)

**Modelo**: `gpt-4o-mini`
Se usa para: Responder preguntas y explicar el código.

| Concepto | Precio |
| :--- | :--- |
| **Input (Contexto)** | **$0.15** / 1,000,000 tokens |
| **Output (Respuesta)** | **$0.60** / 1,000,000 tokens |

### Ejemplo Práctico: Una Pregunta

Cuando haces una pregunta, enviamos tu pregunta + fragmentos de código relevantes (contexto).

* **Input**: ~3,000 tokens de contexto (código recuperado). Costo: $0.00045
* **Output**: ~500 tokens de respuesta (explicación). Costo: $0.0003
* **Costo Total por Pregunta**: **$0.00075** (Menos de una décima de centavo)

---

## Comparativa con Otros Modelos

Para entender por qué elegimos `gpt-4o-mini`:

| Modelo | Input (1M tokens) | Output (1M tokens) | Costo por Pregunta (aprox) |
| :--- | :--- | :--- | :--- |
| **GPT-4o-mini (Actual)** | **$0.15** | **$0.60** | **~$0.0007** |
| GPT-3.5-Turbo | $0.50 | $1.50 | ~$0.0025 (3x más caro) |
| GPT-4o (Potente) | $5.00 | $15.00 | ~$0.0250 (35x más caro) |
| Claude 3.5 Sonnet | $3.00 | $15.00 | ~$0.0180 (25x más caro) |

## Conclusión Mensual Estimada

Si usas el asistente intensamente (ej: 10 sincronizaciones de repo y 500 preguntas al mes):

1. **Syncs**: 10 * $0.002 = $0.02
2. **Chats**: 500 * $0.00075 = $0.375

**Total Estimado al Mes: ~$0.40 USD**

Es una solución extremadamente económica y escalable.
