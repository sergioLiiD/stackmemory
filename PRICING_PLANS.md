# 🎫 StackMemory: Planes y Límites de Uso

Este documento define las características y cuotas de uso para cada nivel de suscripción. Estos valores sirven como la "fuente de verdad" para la implementación técnica de los límites en la aplicación.

## 1. Plan FREE (Hacker)

*Destinado a desarrolladores individuales que prueban la herramienta.*

| Característica | Límite / Valor |
| :--- | :--- |
| **Proyectos Activos** | 1 Proyecto |
| **Mensajes de Chat (IA)** | 20 / mes |
| **Insights de Proyecto** | 1 / mes |
| **Modelo de IA** | Gemini 3.0 Flash |
| **Multimodal (Imagen/Video)** | ❌ No incluido |
| **Historial de Chat** | 7 días |
| **Acceso MCP** | ❌ No incluido |
| **Soporte** | Comunidad |

## 2. Plan PRO (Suscripción)

*Para profesionales que necesitan documentación y análisis continuo.*

* **Precio**: 34,99€ / mes

| Característica | Límite / Valor |
| :--- | :--- |
| **Proyectos Activos** | **Ilimitados** |
| **Mensajes de Chat (IA)** | **500 / mes** |
| **Insights de Proyecto** | 50 / mes |
| **Modelo de IA** | Gemini 3.0 Pro + Flash |
| **Multimodal (Imagen/Video)** | ✅ Incluido |
| **Historial de Chat** | Ilimitado |
| **Acceso MCP** | ✅ Incluido |
| **Soporte** | Prioritario (Email) |

## 3. Plan ANUAL (Founder/Annual)

*Mismas ventajas que el plan Pro con pago anual.*

* **Precio**: 99€ / pago único anual

| Característica | Límite / Valor |
| :--- | :--- |
| **Características** | Idénticas al Plan Pro |
| **Duración** | 1 año de acceso Pro |

---

## 🛠 Notas de Implementación (Enforcements)

1. **Contador de Uso**: Se debe llevar un registro en la tabla `profiles` o una tabla dedicada de `usage_logs` para contar los mensajes de chat y la generación de insights por periodo de facturación.
2. **Reset Mensual**: Los contadores de IA se deben resetear cada 30 días basándose en la fecha de creación del perfil o el ciclo de facturación.
3. **Bloqueo de Interfaz**: Si el usuario llega al límite, se debe mostrar un modal de "Upgrade" o un mensaje de "Límite alcanzado".
4. **Bypass de Admin**: Los correos `sergio@ideapunkt.de` y `sergio@liid.mx` ignoran todos los límites.
