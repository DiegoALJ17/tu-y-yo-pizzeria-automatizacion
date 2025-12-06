# Tu y Yo Pizzería - Framework de Automatización

## 🚀 Características

- ✅ **Page Object Model (POM)**: Arquitectura escalable y mantenible
- ✅ **Helpers Especializados**: 10 helpers para funcionalidades específicas
- ✅ **Data-Driven Testing**: Datos de prueba en JSON + generación con Faker.js
- ✅ **Logging Comprehensivo**: Sistema de logs con colores y archivos
- ✅ **Allure Reporting**: Reportes visuales detallados
- ✅ **Screenshots Automáticos**: Captura de evidencia en cada paso
- ✅ **Fixtures Personalizados**: Reutilización de setup común
- ✅ **Selectores Centralizados**: Mantenimiento simplificado
- ✅ **Validaciones de Seguridad**: Tests de XSS, SQL Injection, etc.
- ✅ **Retry Logic**: Manejo robusto de fallos intermitentes
---
## 📁 Estructura del Proyecto
```
playwright-automation/
├── 📂 data/                      # Datos de prueba
│   ├── Customers.json            # Datos de clientes (válidos/inválidos)
│   ├── pizzas.json               # Catálogo de pizzas y escenarios
│   └── TestDataHelper.js         # Generador de datos con Faker
│
├── 📂 fixtures/                  # Fixtures de Playwright
│   └── baseFixtures.js           # Setup común para todos los tests
│
│── 📂 helpers/    
│   ├── CartHelper.js             # Operaciones del carrito
│   ├── CheckoutHelper.js         # Proceso de checkout
│   ├── NavigationHelper.js       # Navegación por categorías
│   ├── ProductModalHelper.js     # Modales de productos
│   ├── SearchHelper.js           # Búsqueda de productos
│   ├── SocialMediaHelper.js      # Verificación de redes sociales
│   ├── testHelpers.js            # Utilidades para tests
│   
├── 📂 pages/                     # Page Object Model
│   ├── AlertModalPage.js         # Modal de alertas de horario
│   ├── BasePage.js               # Clase base con métodos comunes
│   ├── CartPage.js               # Página del carrito
│   ├── HomePage.js               # Página principal
│   └── PizzaModalPage.js         # Modal de configuración de pizza
│
├── 📂 tests/                     # Archivos de prueba (24 archivos)
│      ├── addBebida.spec.js
│      ├── addLicorMandarina.spec.js
│      ├── addPasta.spec.js
│      ├── addPizzaMixta.spec.js
│      ├── addPizzasSaboresTradicionales.spec.js
│      ├── addPizzasSpeciales.spec.js
│      ├── addPostre.spec.js
│      ├── addSpaghetti.spec.js
│      ├── addTukumanas.spec.js
│      └── addVegetarianaPizza.spec.js
│      ├── Deletecartproduct.spec.js
│      └── Editcartproduct.spec.js
│      ├── buyPizza.spec.js
│      ├── Searchproducts.spec.js
│      ├── Verifyemptycart.spec.js
│      └── Socialmediabuttons.spec.js
│      ├── Advancedvalidation.spec.js
│      ├── quickTestAlert.spec.js
│      └── debugSelectors.spec.js
│
├── 📂 utils/                     # Helpers y utilidades
│   ├── Locators.js               # Selectores centralizados
│   ├── logger.js                 # Sistema de logging
│   └── ValidationHelper.js       # Validaciones de seguridad
│
├── 📂 screenshots/               # Capturas de pantalla
├── 📂 logs/                      # Archivos de log
├── 📂 allure-results/           # Resultados de Allure
├── 📂 playwright-report/        # Reportes HTML
├── 📂 test-results/             # Resultados de ejecución
│
├── 📄 .env                       # Variables de entorno
├── 📄 .gitignore                # Archivos ignorados
├── 📄 package.json              # Dependencias del proyecto
├── 📄 playwright.config.js      # Configuración de Playwright
└── 📄 README.md                 # Este archivo
```
## 📦 Requisitos Previos

- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior
- **Sistema Operativo**: Windows 10

### Verificar instalación:
```bash
node --version  # Debe ser >= 18.0.0
npm --version   # Debe ser >= 9.0.0
```
---

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone 
cd 
```
### 2. Instalar dependencias
```bash
npm install
```
### 3. Instalar navegadores de Playwright
```bash
npx playwright install
```
## 🧪 Ejecución de Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo headed (con interfaz gráfica)
npm run test:headed

# Ejecutar tests en modo UI (Interfaz Gráfica)
npm test -- --ui 

# Ejecutar un archivo específico
npx playwright test tests/buyPizza.spec.js
```

### Ejecución Paralela

```bash
# Ejecutar con 5 workers
npx playwright test --workers=5

# Ejecutar de forma serial (1 worker)
npx playwright test --workers=1
```
## 📈 Reportes
```bash
# Generar y abrir reporte
npx playwright show-report
```
El reporte incluye:
- ✅ Estado de cada test (Pass/Fail)
- ✅ Duración de ejecución
- ✅ Screenshots de fallos
- ✅ Videos de ejecución
- ✅ Traces para debugging

### Reporte Allure

```bash
# Generar reporte de resultados de allure
allure serve allure-results
# Generar reporte Allure
npm run allure:generate

# Abrir reporte Allure
npm run allure:open
```
**Características del reporte Allure:**
- 📊 Gráficos de ejecución
- 📋 Categorización por features
- 🏷️ Tags y severidad
- 📎 Attachments (screenshots, logs, datos)
- 📈 Historial de ejecuciones
- ⏱️ Análisis de duración
