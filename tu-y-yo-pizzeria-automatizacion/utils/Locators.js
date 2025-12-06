/**
 * Locators centralizados para toda la aplicación
 * Facilita el mantenimiento y reutilización de selectores
 */

export class Locators {

  // NAVEGACIÓN Y HEADER
  static navigation = {
    menuButton: 'button[aria-label="menu"]',
    searchIcon: 'button:has(i.mdi-magnify)',
    cartIcon: 'button:has(i.mdi-cart)',
    cartBadge: '.v-badge__badge, [class*="badge"]',
    logo: 'img, a img, [alt*="logo"]',
    
    // Menú de categorías
    menuCategories: {
      pizzasTradicionales: 'text=PIZZAS TRADICIONALES',
      pizzasEspeciales: 'text=PIZZAS ESPECIALES',
      pizzasMixtas: 'text=PIZZAS MIXTAS',
      saboresTradicionales: 'text=2 SABORES TRADICIONALES',
      saboresEspeciales: 'text=2 SABORES ESPECIALES',
      pastas: 'text=PASTAS',
      bebidas: 'text=BEBIDAS',
      licores: 'text=LICORES ARTESANALES DE LA CASA',
      postres: 'text=POSTRES',
      tucumanas: 'text=TUCUMANAS'
    }
  };

  // BÚSQUEDA
  static search = {
    input: 'input[placeholder*="¿Qué te gustaría pedir?"]',
    button: 'button:has-text("Buscar")',
    closeButton: 'button:has(i.mdi-close).red--text',
    noResults: 'text=No se encontraron resultados'
  };

  // PRODUCTOS (CARDS)
  static product = {
    cards: ['.card', '.v-card', '[class*="card"]'],
    names: ['.card h3', '.card h4', '.v-card h3', '.v-card h4', 'h3', 'h4'],
    prices: 'text=/Bs\\.|strong:has-text("Bs.")',
    addToCartButtons: [
      'button:has-text("AGREGAR AL CARRITO")',
      'button:has-text("Agregar al carrito")',
      'button.v-btn:has-text("AGREGAR")'
    ],
    
    // Helper para obtener botón de un producto específico
    getAddButtonForProduct: (productName) => [
      `button:has-text("AGREGAR AL CARRITO")`,
      `text=${productName}`,
    ]
  };

  // MODAL DE CONFIGURACIÓN DE PRODUCTO
 
  static productModal = {
    container: '.v-dialog--active',
    overlay: '.v-overlay__scrim',
    title: '.v-dialog--active h2, .v-dialog--active h3, .v-dialog--active h1',
    closeButton: '.v-dialog--active button[aria-label="close"]',
    
    // Tamaños (específico para pizzas)
    sizeButtons: '.v-icon.mdi-circle-slice-8',
    size12Slices: 'text=12 Porciones (40 cm)',
    size8Slices: 'text=8 Porciones (30 cm)',
    size4Slices: 'text=4 Porciones (20 cm)',
    
    // Extras
    extrasSection: 'text=Extras',
    checkboxes: 'input[type="checkbox"]',
    extraCheeseCheckbox: 'input[value*="Queso"]',
    extraCheeseLabel: 'label:has-text("Extra Queso"), label:has-text("Queso")',
    
    // Dato extra / Comentarios
    commentTextarea: 'textarea[placeholder*="Dato extra"], textarea[placeholder="Dato extra"]',
    
    // Cantidad
    quantityInput: 'input[type="text"], input[type="number"]',
    increaseButton: 'button:has(i.mdi-plus)',
    decreaseButton: 'button:has(i.mdi-minus)',
    
    // Precio y confirmación
    priceDisplay: [
      'button.text-capitalize.v-btn--block strong:has-text("Bs.")',
      'button.v-btn--block[style*="background-color: rgb(0, 144, 0)"] strong',
      'button.v-btn--rounded strong:has-text("Bs.")',
      'strong:has-text("Bs.")'
    ],
    
    confirmButton: [
      'button.text-capitalize.v-btn--block.v-btn--rounded.v-btn--large[style*="background-color: rgb(0, 144, 0)"]',
      '.v-dialog--active button.text-capitalize.v-btn--block[style*="background-color: rgb(0, 144, 0)"]',
      'button.v-btn--block.v-btn--rounded[style*="background-color: rgb(0, 144, 0)"]',
      'button[style*="background-color: rgb(0, 144, 0)"]:has-text("Bs.")'
    ]
  };

  
  // MODAL DE CONFIRMACIÓN (SweetAlert2)
 
  static confirmationModal = {
    container: '.swal2-container',
    title: '.swal2-title',
    content: '.swal2-content, .swal2-html-container',
    confirmButton: 'button.swal2-confirm',
    cancelButton: 'button.swal2-cancel, button:has-text("Seguir comprando")',
    closeButton: 'button.swal2-close'
  };

 
  // MODAL DE ALERTA (Horarios)
  
  static alertModal = {
    container: '.v-dialog--active, .v-overlay--active',
    title: '.v-dialog--active h2, .v-dialog--active .headline',
    message: '.v-dialog--active .v-card__text, .v-dialog--active p',
    
    // Botones de cierre
    understoodButton: [
      'button[style*="background-color: rgb(0, 144, 0)"]:has-text("ENTENDIDO")',
      'button.v-btn:has-text("ENTENDIDO")',
      'button:has-text("ENTENDIDO")',
      'button:has-text("Entendido")'
    ],
    acceptButton: 'button:has-text("Aceptar"), button:has-text("OK"), button:has-text("ACEPTAR")',
    closeButton: 'button:has-text("Cerrar"), button:has-text("CERRAR")'
  };

  // CARRITO
  static cart = {
    title: ['h1:has-text("Carrito")', 'h2:has-text("Carrito")', 'text=Resumen del pedido'],
    emptyMessage: ['text=/carrito vacío/i', 'text=/carrito está vacío/i'],
    
    // Items del carrito
    items: '.cart-item, [class*="cart-item"]',
    itemName: '.cart-item-name, [class*="item-name"]',
    itemPrice: '.cart-item-price, [class*="item-price"]',
    itemQuantity: '.cart-item-quantity, [class*="quantity"]',
    
    // Controles de cantidad
    increaseQuantity: 'button[aria-label="increase quantity"], button:has(i.mdi-plus)',
    decreaseQuantity: 'button[aria-label="decrease quantity"], button:has(i.mdi-minus)',
    removeItem: 'button[aria-label="remove item"], button:has(i.mdi-delete)',
    
    // Totales
    subtotal: 'text=/Subtotal/i',
    total: 'text=/Total/i',
    
    // Acciones
    continueButton: 'button:has-text("CONTINUAR"), button:has-text("Continuar")',
    checkoutButton: 'button:has-text("FINALIZAR COMPRA"), button:has-text("IR AL PAGO")',
    continueShopping: 'button:has-text("SEGUIR COMPRANDO"), button:has-text("Seguir comprando")'
  };

  // CHECKOUT / FORMULARIO
  static checkout = {
    // Información del cliente
    nameInput: 'input[placeholder*="Nombre"], input[name="name"]',
    phoneInput: 'input[placeholder*="Teléfono"], input[placeholder*="Celular"], input[name="phone"]',
    emailInput: 'input[placeholder*="Email"], input[type="email"]',
    addressInput: 'input[placeholder*="Dirección"], textarea[placeholder*="Dirección"]',
    
    // Tipo de entrega
    deliveryType: {
      pickup: 'text=Recojo en tienda, text=Recoger en local',
      scheduledPickup: 'text=Recojo programado',
      delivery: 'text=Delivery, text=Entrega a domicilio'
    },
    
    // Fecha y hora
    dateInput: 'input[type="date"]',
    timeInput: 'input[type="time"]',
    
    // Comentarios adicionales
    commentsTextarea: 'textarea[placeholder*="Comentarios"], textarea[placeholder*="comentario"]',
    
    // Método de pago
    paymentMethod: {
      cash: 'text=Efectivo',
      card: 'text=Tarjeta',
      qr: 'text=QR'
    },
    
    // Botones de acción
    confirmButton: 'button:has-text("CONFIRMAR PEDIDO"), button:has-text("Confirmar")',
    backButton: 'button:has-text("VOLVER"), button:has-text("Atrás")'
  };

 
  // MENSAJES Y NOTIFICACIONES
 
  static messages = {
    success: '.v-snackbar--active.success, .alert-success, .swal2-success',
    error: '.v-snackbar--active.error, .alert-error, .swal2-error',
    warning: '.v-snackbar--active.warning, .alert-warning',
    info: '.v-snackbar--active.info, .alert-info'
  };

  // HELPERS PARA SELECTORES DINÁMICOS
  
  
   //Obtiene múltiples variantes de un selector
   
  static getVariants(baseSelector, variants = []) {
    return [baseSelector, ...variants];
  }

   //Construye un selector para un producto específico
   
  static getProductSelector(productName) {
    return `text=${productName}`;
  }


   // Construye un selector para un botón dentro de un contenedor
   
  static getButtonInContainer(containerSelector, buttonText) {
    return `${containerSelector} button:has-text("${buttonText}")`;
  }


   //Construye selector para elemento con texto específico
  
  static withText(text) {
    return `text=${text}`;
  }

  
   //Construye selector para elemento que contiene texto
   
  static containingText(text) {
    return `text=/${text}/i`;
  }
}

export default Locators;