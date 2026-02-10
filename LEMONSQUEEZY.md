# 🍋 Configuración de Lemon Squeezy (StackMemory)

Este documento detalla la configuración necesaria en el panel de Lemon Squeezy para que la integración con StackMemory funcione correctamente en el entorno **Live**.

## 1. Configuración de la Tienda

- **Type**: Business Use (Recomendado para manejar VAT/IVA correctamente).
- **Tax Settings**: Activar "Allow customers to choose whether they are an individual or a business".

## 2. Productos y Planes

### 🚀 Plan Pro (Monthly Subscription)

- **Precio**: 34,99€ / mes.
- **Descripción**:
    > **"The ultimate Second Brain for professional developers. Document and master your entire portfolio without limits."**
    >
    > Unlock the full potential of your codebase with StackMemory Pro. Designed for developers who need deep architectural understanding and zero friction.
    >
    > **Key Features included:**
    > - **Unlimited Projects**: Connect and sync as many repositories as you need.
    > - **Full Gemini 3.0 Pro Access**: Leverage Google’s most powerful model for complex reasoning and massive context windows.
    > - **Infinite AI Insights**: No limits on Chats or Deep Dive insights.
    > - **Multimodal Debugging**: Analyze screenshots and terminal recordings directly within your code context.

### 🌟 Plan Annual (Yearly Access)

- **Precio**: 99€ / pago único (o suscripción anual).
- **Descripción**: Todo lo incluido en el plan Pro, con acceso garantizado por 1 año a un precio preferencial.

## 3. Links de Confirmación y Recibos

Configurar estos links en el panel de producto de Lemon Squeezy:

- **Button Link (In-app Confirmation & Email)**: `https://stackmemory.app/dashboard`
- **Button Text**: `Go to Dashboard`
- **Product Links (Email Receipt Buttons)**:
    1. **Go to Dashboard**: `https://stackmemory.app/dashboard`
    2. **Quick Start Guide**: `https://stackmemory.app/dashboard/guide`
    3. **Support & Feedback**: `https://stackmemory.app`

## 4. Configuración Técnica (Webhook)

Para activar los planes automáticamente, debes configurar un Webhook:

- **Webhook URL**: `https://stackmemory.app/api/webhooks/lemonsqueezy`
- **Events to Listen**:
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `order_created` (Opcional, para pagos únicos).

## 5. Variables de Entorno (.env.local)

Una vez creados los productos en Live, actualiza estos valores con los **nuevos IDs**:

```bash
# IDs de los productos LIVE
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_PRO=NUEVO_ID_AQUI
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID_LTD=NUEVO_ID_AQUI

# Secreto del Webhook (proporcionado por Lemon Squeezy al crear el webhook)
LEMONSQUEEZY_WEBHOOK_SECRET=TU_SIGNING_SECRET_AQUI
```
