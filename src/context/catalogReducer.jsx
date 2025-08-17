// src/context/catalogReducer.jsx

const initialFoodItems = [
  { id: 1, name: "Cheeseburger", price: "35.000", image: "/images/burger.jpg", category: "Foods", detail: "Classic beef patty with cheddar cheese and fresh vegetables." },
  { id: 2, name: "French Fries", price: "20.000", image: "/images/fries.jpg", category: "Foods", detail: "Crispy golden potato fries, lightly salted." },
  { id: 3, name: "Chicken Wings", price: "40.000", image: "/images/wings.jpg", category: "Foods", detail: "Spicy and tangy chicken wings, perfect for sharing." },
  { id: 4, name: "Iced Coffee", price: "25.000", image: "/images/coffee.jpg", category: "Beverages", detail: "Rich espresso with milk and sugar, served over ice." },
  { id: 5, name: "Sushi Roll", price: "50.000", image: "/images/sushi.jpg", category: "Foods", detail: "Fresh salmon and avocado wrapped in seaweed and rice." },
  { id: 6, name: "Chocolate Cake", price: "30.000", image: "/images/cake.jpg", category: "Dessert", detail: "Decadent dark chocolate cake with a molten center." },
  { id: 7, name: "Vanilla Cake", price: "30.000", image: "/images/cake.jpg", category: "Dessert", detail: "Light and fluffy vanilla sponge cake with buttercream frosting." },
];

export const actionTypes = {
  SET_SEARCH: "SET_SEARCH",
  SET_CATEGORY: "SET_CATEGORY",
  ADD_TO_CART: "ADD_TO_CART",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  ADD_MENU_ITEM: "ADD_MENU_ITEM",
  EDIT_MENU_ITEM: "EDIT_MENU_ITEM", // New action type for editing
  DELETE_MENU_ITEM: "DELETE_MENU_ITEM",
};

export const initialState = {
  foodItems: initialFoodItems,
  cart: [],
  search: "",
  selectedCategory: "All Menu",
};

export const catalogReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_SEARCH:
      return {
        ...state,
        search: action.payload,
      };

    case actionTypes.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };

    case actionTypes.ADD_TO_CART: {
      const itemToAdd = action.payload;
      const existingItem = state.cart.find((item) => item.id === itemToAdd.id);

      if (existingItem) {
        const updatedCart = state.cart.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return { ...state, cart: updatedCart };
      } else {
        const priceAsNumber = parseInt(itemToAdd.price.replace(".", ""), 10);
        const newItem = { ...itemToAdd, price: priceAsNumber, quantity: 1 };
        return { ...state, cart: [...state.cart, newItem] };
      }
    }

    case actionTypes.UPDATE_QUANTITY: {
      const { itemId, delta } = action.payload;
      const updatedCart = state.cart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0);
      return { ...state, cart: updatedCart };
    }

    case actionTypes.ADD_MENU_ITEM: {
        const newItem = action.payload;
        return {
            ...state,
            foodItems: [...state.foodItems, newItem]
        }
    }

    // This finds an item by its ID and replaces it with the updated version.
    case actionTypes.EDIT_MENU_ITEM: {
        const updatedItem = action.payload;
        const updatedFoodItems = state.foodItems.map(item =>
            item.id === updatedItem.id ? updatedItem : item
        );
        return {
            ...state,
            foodItems: updatedFoodItems,
        };
    }

    // This filters the array, returning a new array without the deleted item.
    case actionTypes.DELETE_MENU_ITEM: {
        const itemIdToDelete = action.payload;
        const updatedFoodItems = state.foodItems.filter(
            item => item.id !== itemIdToDelete
        );
        return {
            ...state,
            foodItems: updatedFoodItems,
        };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
