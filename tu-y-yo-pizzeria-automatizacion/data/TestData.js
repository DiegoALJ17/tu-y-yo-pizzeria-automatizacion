import { faker } from '@faker-js/faker';

export class TestDataHelper {
  static generateCustomerData() {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number('+591 ### ### ###'),
      address: {
        street: faker.location.streetAddress(),
        city: 'Cochabamba',
        zone: faker.location.county(),
        reference: faker.location.secondaryAddress()
      }
    };
  }

  static generateOrderData() {
    return {
      customer: this.generateCustomerData(),
      deliveryTime: faker.helpers.arrayElement(['Lo antes posible', '30 minutos', '1 hora']),
      paymentMethod: faker.helpers.arrayElement(['Efectivo', 'Tarjeta', 'QR']),
      notes: faker.lorem.sentence()
    };
  }

  static getRandomPizzaName() {
    const pizzas = [
      'VEGETARIANA',
      'GRECA',
      'ALFONSINA',
      'PRIMAVERA',
      'HAWAIANA',
      'PEPPERONI',
      'MARGARITA'
    ];
    return faker.helpers.arrayElement(pizzas);
  }

  static getRandomQuantity(min = 1, max = 5) {
    return faker.number.int({ min, max });
  }

  static generateSearchTerms() {
    return [
      'pizza',
      'vegetariana',
      'pepperoni',
      'pollo',
      'queso',
      'jamón'
    ];
  }

  static getRandomSearchTerm() {
    return faker.helpers.arrayElement(this.generateSearchTerms());
  }

  static generateInvalidEmail() {
    return faker.lorem.word() + '@';
  }

  static generateInvalidPhone() {
    return faker.string.numeric(5);
  }

  static getMenuCategories() {
    return [
      'pizzasTradicionales',
      'pizzasEspeciales',
      'pizzasMixtas',
      'saboresTradicionales',
      'saboresEspeciales',
      'pastas',
      'bebidas',
      'postres'
    ];
  }

  static getRandomCategory() {
    return faker.helpers.arrayElement(this.getMenuCategories());
  }

  static generateMultipleOrders(count = 3) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      orders.push(this.generateOrderData());
    }
    return orders;
  }

  static generateCreditCardData() {
    return {
      number: faker.finance.creditCardNumber(),
      holder: faker.person.fullName(),
      expiry: faker.date.future().toLocaleDateString('es-BO', { month: '2-digit', year: '2-digit' }),
      cvv: faker.finance.creditCardCVV()
    };
  }

  static generatePromoCode() {
    return faker.string.alphanumeric(8).toUpperCase();
  }

  static setLocale(locale = 'es') {
    faker.setLocale(locale);
  }

  static resetFaker() {
    faker.seed();
  }

  static seedFaker(seed) {
    faker.seed(seed);
  }
}