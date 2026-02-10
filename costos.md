# 💰 Plan de Costos y Escalabilidad (StackMemory)

Este documento proyecta los costos operativos mensuales estimados considerando Infraestructura (Vercel, Supabase) e Inteligencia Artificial (OpenAI), permitiendo definir el precio del "Lifetime Deal".

## 1. Estructura de Costos Base

### ☁️ Infraestructura (Fixed Costs)

Para operar comercialmente (y evitar límites de planes gratuitos), asumimos los planes "Pro" desde el inicio del programa Beta.

| Servicio | Plan | Costo Base Mensual | Incluye |
| :--- | :--- | :--- | :--- |
| **Vercel** | Pro | **$20** | 1TB Bandwidth, 1M Edge Requests (Suficiente hasta ~5k usuarios). |
| **Supabase** | Pro | **$25** | 8GB Database, 100GB Transfer, Backups diarios. |
| **Total Fijo** | | **$45 / mes** | Base operativa mínima. |

### 🧠 Inteligencia Artificial (Variable Costs)

Estimación basada en uso "Intensivo Promedio" (sincronización semanal + consultas diarias).

* **Promedio por Usuario**: ~$0.50 USD / mes
  * *Desglose*: $0.05 (Sync) + $0.45 (Chat/RAG con GPT-4o-mini).

---

## 2. Tabla de Escalamiento

Proyección de costos totales según el volumen de usuarios activos.

| Escenario | Usuarios | Costo Fijo (Infra) | Costo Variable (AI @ $0.50) | **Costo Total Mensual** | **Costo Real por Usuario** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MVP / Testing** | 10 | $0 (Free Tier) | $5 | **$5** | $0.50 |
| **Alpha** | 50 | $0 (Free Tier) | $25 | **$25** | $0.50 |
| **Beta (Objetivo)** | **500** | $45 | $250 | **$295** | **$0.59** |
| **Growth 1** | 1,000 | $45 | $500 | **$545** | $0.55 |
| **Growth 2** | 5,000 | $65* | $2,500 | **$2,565** | $0.51 |

*\*Nota: En 5,000 usuarios, podríamos exceder ligeramente los límites base de Supabase/Vercel (Disk/Requests), añadiendo un estimado de $20 extra.*

---

## 3. Estrategia de Precios (Lifetime Deal)

Para el programa de **500 Beta Testers**, el objetivo es financiar el desarrollo y cubrir costos operativos de al menos 2-3 años.

### Análisis de Lifetime Deal (LTD)

Si el costo operativo de un usuario es **~$0.60 / mes** ($7.20 / año).

* **Costo a 3 años**: ~$21.60 USD
* **Costo a 1 año**: ~$11.60 USD (Incluyendo base)

### Propuesta de Precio LTD

Para ser rentable y atractivo:

* **Plan Pro**: **34,99€ / mes** (Suscripción).
* **Plan Anual**: **99€ / pago único** (1 año de acceso).
  * *Ingresos (500 usuarios @ 99€)*: **~50,000€**.
  * *Runway*: Con los nuevos precios, la rentabilidad es significativamente mayor.

### Límites Sugeridos para Sostenibilidad

Para evitar abusos y garantizar márgenes de beneficio:

1. **Proyectos**: Ilimitados (Bajo costo de almacenamiento).
2. **Sincronizaciones**: 50 / mes (Evita resyncs compulsivos).
3. **Chat (Fair Use)**: **500 mensajes / mes** (Costo estimado de IA < $1.00).
    * *Si exceden*: Ofertar paquete de "créditos AI" o esperar al siguiente mes.

---

## 4. Próximos Pasos de Implementación

1. [ ] Configurar **Vercel Pro** y **Supabase Pro** (antes de recibir tráfico real del LTD).
2. [ ] Implementar **Límites de Uso** en el backend (Contador de tokens/mensajes por usuario).
3. [ ] Integrar Pasarela de Pago (Stripe) para el cobro del LTD.
