import { allure } from 'allure-playwright';

export class TestHelpers {
  
   //Agrega información adicional al reporte de Allure
   
  static addAllureInfo(test, description, severity = 'normal') {
    allure.description(description);
    allure.severity(severity);
  }


   //Agrega un paso al reporte de Allure
   
  static async addStep(stepName, stepFunction) {
    return await allure.step(stepName, stepFunction);
  }

   //Agrega un attachment al reporte
   
  static addAttachment(name, content, type = 'text/plain') {
    allure.attachment(name, content, type);
  }

   //Marca el test con etiquetas
   
  static addTags(...tags) {
    tags.forEach(tag => allure.tag(tag));
  }

   //Agrega un link al reporte
   
  static addLink(name, url) {
    allure.link(name, url);
  }

  
   //Espera un tiempo específico (usar con precaución)
   
  static async wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }


   //Genera un timestamp único para nombres de archivo
   
  static getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
  }

   //Formatea un precio de texto a número
   
  static parsePrice(priceString) {
    return parseFloat(priceString.replace('Bs.', '').replace(',', '.').trim());
  }

   //Genera un número aleatorio dentro de un rango
   
  static getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  
   //Selecciona un elemento aleatorio de un array
   
  static getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

   // Valida formato de email
   
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

   //Valida formato de teléfono boliviano
   
  static isValidBolivianPhone(phone) {
    const phoneRegex = /^\+591\s?\d{3}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
  }

   //Formatea un número de teléfono
   
  static formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);
    if (match) {
      return `+591 ${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  }

  
   // Crea un directorio si no existe
  
  static async ensureDirectoryExists(dirPath) {
    const fs = await import('fs');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }


   //Lee un archivo JSON
   
  static async readJsonFile(filePath) {
    const fs = await import('fs');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData);
  }

  
   // Escribe datos en un archivo JSON
   
  static async writeJsonFile(filePath, data) {
    const fs = await import('fs');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  
   //Calcula el total de un array de precios
   
  static calculateTotal(prices) {
    return prices.reduce((total, price) => {
      return total + this.parsePrice(price);
    }, 0);
  }

  
   // Retry de una función con reintentos
   
  static async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.wait(delay);
      }
    }
  }

  
   // Limpia un string de caracteres especiales
   
  static cleanString(str) {
    return str.replace(/[^\w\s]/gi, '').trim();
  }

  
   //Convierte un string a formato de título (Primera letra mayúscula)
   
  static toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

  
   // Valida que un array no esté vacío
   
  static isArrayNotEmpty(array) {
    return Array.isArray(array) && array.length > 0;
  }

  
   // Obtiene la fecha actual en formato boliviano
   
  static getCurrentDateBolivian() {
    return new Date().toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  
   // Convierte segundos a formato de tiempo legible
  
  static formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
}
