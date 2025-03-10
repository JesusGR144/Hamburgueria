const products = [
  { name: 'Hamburguesa', price: 55 },
  { name: 'Papas', price: 30 },
  { name: 'Perrito', price: 30 },
  { name: 'Ingrediente extra', price: 5 }
];

// Definimos explícitamente los precios de la promoción
const prices = {
  hotdog: 30,          // Precio de un perrito individual
  hotdogPromo: 50      // Precio de dos perritos en promoción
};

const extraIngredientsAvailable = [
  'Tocino', 'Champiñones', 'Piña', 'Salchicha roja', 'Salchicha de jalapeño'
];

class Food {
  constructor(product, ingredients) {
      this.product = product;
      this.price = product.price;
      this.ingredients = ingredients;
      this.extraIngredients = [];
      this.typeFood = product.name;
  }

  addExtraIngredient(ingredient) {
      this.extraIngredients.push(ingredient);
  }

  calculatePrice() {
      const extraIngredientPrice = products.find(p => p.name === 'Ingrediente extra').price;
      return this.price + this.extraIngredients.length * extraIngredientPrice;
  }
}

class Order {
  constructor() {
      this.items = [];
      this.discount = 0; // Porcentaje de descuento (0-100)
      this.fixedDiscount = 0; // Descuento en cantidad fija
      this.discountType = 'none'; // Tipo de descuento: 'percentage', 'fixed' o 'none'
  }

  addItem(food, quantity) {
      this.items.push({ food, quantity });
      this.printOrder(); // Actualizamos automáticamente al agregar items
  }

  setDiscount(discountValue, discountType) {
      if (discountType === 'percentage') {
          this.discount = parseFloat(discountValue) || 0;
          this.fixedDiscount = 0;
      } else if (discountType === 'fixed') {
          this.fixedDiscount = parseFloat(discountValue) || 0;
          this.discount = 0;
      } else {
          this.discount = 0;
          this.fixedDiscount = 0;
      }
      this.discountType = discountType;
  }

  calculateTotal() {
    let total = 0;
    let hotdogCount = 0;
    let hotdogExtraTotal = 0;
    const extraIngredientPrice = products.find(p => p.name === 'Ingrediente extra').price;

    // Primero contamos los perritos y calculamos el total para otros productos
    for (const item of this.items) {
        if (item.food.typeFood === "Perrito") {
            hotdogCount += item.quantity;
            // Calcular el costo de ingredientes extra para perritos
            hotdogExtraTotal += item.food.extraIngredients.length * extraIngredientPrice * item.quantity;
        } else {
            total += item.food.calculatePrice() * item.quantity;
        }
    }

    // Aplicar promoción de perritos
    const promoPairs = Math.floor(hotdogCount / 2);
    total += promoPairs * prices.hotdogPromo; // Precio promocional por cada par
    total += (hotdogCount % 2) * prices.hotdog; // Precio individual para perrito impar
    total += hotdogExtraTotal; // Sumar el total de extras de perritos

    // Aplicar descuento según el tipo
    if (this.discountType === 'percentage' && this.discount > 0) {
      total = total * (1 - this.discount / 100);
    } else if (this.discountType === 'fixed' && this.fixedDiscount > 0) {
      total = Math.max(0, total - this.fixedDiscount); // Evitar totales negativos
    }

    return total;
  }

  // Método para obtener el valor del descuento aplicado (para mostrarlo)
  getAppliedDiscountText() {
    if (this.discountType === 'percentage' && this.discount > 0) {
      return `${this.discount}%`;
    } else if (this.discountType === 'fixed' && this.fixedDiscount > 0) {
      return `$${this.fixedDiscount.toFixed(2)}`;
    } else {
      return "0%";
    }
  }

  calculateItemSubtotal(item) {
    const food = item.food;
    const quantity = item.quantity;
    
    if (food.typeFood !== "Perrito") {
      return food.calculatePrice() * quantity;
    }
    
    const extraIngredientPrice = products.find(p => p.name === 'Ingrediente extra').price;
    const extraCost = food.extraIngredients.length * extraIngredientPrice * quantity;
    
    let basePrice;
    if (quantity >= 2) {
      const pairs = Math.floor(quantity / 2);
      const remaining = quantity % 2;
      basePrice = pairs * prices.hotdogPromo + remaining * prices.hotdog;
    } else {
      basePrice = prices.hotdog;
    }
    
    return basePrice + extraCost;
  }

  printOrder() {
      const orderItems = document.getElementById('order-items');
      orderItems.innerHTML = '';

      this.items.forEach(item => {
          const food = item.food;
          const quantity = item.quantity;
          const subtotal = this.calculateItemSubtotal(item);
          const extraIngredients = food.extraIngredients.length > 0 ? food.extraIngredients.join(", ") : "Sencillo";

          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${food.product.name}</td>
              <td>${quantity}</td>
              <td>${extraIngredients}</td>
              <td>$${subtotal.toFixed(2)}</td>
          `;
          orderItems.appendChild(row);
      });

      // Mostrar el total
      const total = this.calculateTotal();
      document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
      
      // Actualizar el texto del descuento si hay uno aplicado
      const discountRow = document.getElementById('discount-row');
      if (discountRow) {
        if (this.discount > 0 || this.fixedDiscount > 0) {
          document.getElementById('discount-value').textContent = this.getAppliedDiscountText();
          discountRow.style.display = ''; // Mostrar fila
        } else {
          discountRow.style.display = 'none'; // Ocultar fila
        }
      }
  }
}

// Inicializaciones
let priceList = document.getElementById('price-list');
let productSelect = document.getElementById('product-select');
let extraIngredientsSection = document.getElementById('extra-ingredients-section');
let extraIngredientsList = document.getElementById('extraIngredientsList');

// Inicializar la lista de precios y selectores de productos
products.forEach(product => {
  const newItem = document.createElement('li');
  newItem.textContent = `${product.name}: $${product.price}`;
  priceList.appendChild(newItem);

  const option = document.createElement('option');
  option.value = product.name;
  option.textContent = product.name;
  productSelect.appendChild(option);
});

// Agregamos la promoción a la lista de precios
const promoItem = document.createElement('li');
promoItem.textContent = `Promoción 2 Perritos: $${prices.hotdogPromo}`;
promoItem.style.color = 'green';
promoItem.style.fontWeight = 'bold';
priceList.appendChild(promoItem);

// Inicializar la lista de ingredientes extra
extraIngredientsAvailable.forEach(ingredient => {
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `extra-${ingredient}`;
  checkbox.name = 'extraIngredient';
  checkbox.value = ingredient;

  const label = document.createElement('label');
  label.htmlFor = `extra-${ingredient}`;
  label.textContent = ingredient;

  extraIngredientsList.appendChild(checkbox);
  extraIngredientsList.appendChild(label);
  extraIngredientsList.appendChild(document.createElement('br'));
});

// Instanciar la orden
const pedido = new Order();

// Event listeners
productSelect.addEventListener('change', () => {
  extraIngredientsSection.style.display = 'block';
  extraIngredientsList.style.display = 'none'; // Aseguramos que la lista de ingredientes extra esté oculta por defecto
  document.getElementById('extraNo').checked = true; // Seleccionamos "No" por defecto
});

document.getElementById('extraYes').addEventListener('change', () => {
  extraIngredientsList.style.display = 'block';
});

document.getElementById('extraNo').addEventListener('change', () => {
  extraIngredientsList.style.display = 'none';
});

// Función para cambiar entre los tipos de entrada de descuento
function toggleDiscountInputs() {
  const selectedType = document.querySelector('input[name="discount-type"]:checked').value;
  
  // Habilitamos/deshabilitamos campos según selección
  document.getElementById('percentage-input').disabled = selectedType !== 'percentage';
  document.getElementById('fixed-input').disabled = selectedType !== 'fixed';
  
  // Aplicamos el descuento según la nueva selección
  applyDiscount();
}

// Función para aplicar descuento según el tipo seleccionado
function applyDiscount() {
  const selectedType = document.querySelector('input[name="discount-type"]:checked').value;
  let discountValue = 0;
  
  if (selectedType === 'percentage') {
    discountValue = document.getElementById('percentage-input').value;
  } else if (selectedType === 'fixed') {
    discountValue = document.getElementById('fixed-input').value;
  }
  
  pedido.setDiscount(discountValue, selectedType);
  pedido.printOrder();
}

// Event listener para agregar ítems al pedido
document.getElementById('add-to-order').addEventListener('click', () => {
  const selectedProduct = products.find(p => p.name === productSelect.value);
  if (!selectedProduct) {
    alert('Por favor selecciona un producto');
    return;
  }
  
  const quantity = parseInt(document.getElementById('quantity').value);
  const hasExtras = document.getElementById('extraYes').checked;
  const selectedExtras = [];

  if (hasExtras) {
      document.querySelectorAll('input[name="extraIngredient"]:checked').forEach(checkbox => {
          selectedExtras.push(checkbox.value);
      });
  }

  const food = new Food(selectedProduct, ["carne", "queso"]);
  selectedExtras.forEach(extra => food.addExtraIngredient(extra));

  pedido.addItem(food, quantity); // La impresión del pedido ahora se hace automáticamente

  // Resetear el formulario
  document.querySelectorAll('input[name="extraIngredient"]:checked').forEach(checkbox => {
    checkbox.checked = false;
  });
  productSelect.value = '';
  document.getElementById('quantity').value = 1;
  extraIngredientsSection.style.display = 'none';
});

// Actualizamos el cambio automáticamente al modificar el monto de pago
document.getElementById('payment').addEventListener('input', () => {
  const paymentAmount = parseFloat(document.getElementById('payment').value);
  const totalAmount = pedido.calculateTotal();
  
  if (isNaN(paymentAmount)) {
    document.getElementById('change-result').textContent = '';
    return;
  }
  
  if (paymentAmount < totalAmount) {
    document.getElementById('change-result').textContent = 
      `El pago de $${paymentAmount.toFixed(2)} es insuficiente. Faltan $${(totalAmount - paymentAmount).toFixed(2)}`;
    document.getElementById('change-result').style.color = 'red';
    return;
  }
  
  const change = paymentAmount - totalAmount;
  document.getElementById('change-result').textContent = 
    `Cambio a devolver: $${change.toFixed(2)}`;
  document.getElementById('change-result').style.color = 'green';
});