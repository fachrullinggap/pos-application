// --- Make sure to export actionTypes ---
export const actionTypes = {
  SET_FOOD_ITEMS: "SET_FOOD_ITEMS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  ADD_TO_CART: "ADD_TO_CART",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  SET_SEARCH: "SET_SEARCH",
  SET_CATEGORY: "SET_CATEGORY",
  ADD_MENU_ITEM: "ADD_MENU_ITEM",
  EDIT_MENU_ITEM: "EDIT_MENU_ITEM",
  DELETE_MENU_ITEM: "DELETE_MENU_ITEM",
  CLEAR_CART: "CLEAR_CART", // <-- NEW ACTION
};

export const initialState = {
  foodItems: [],
  cart: [],
  loading: true,
  error: null,
  search: "",
  selectedCategory: "All Menu",
};

export const catalogReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_FOOD_ITEMS:
      return { ...state, foodItems: action.payload, loading: false };
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actionTypes.SET_SEARCH:
      return { ...state, search: action.payload };
    case actionTypes.SET_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    
    // --- Cart Actions ---
    case actionTypes.ADD_TO_CART: {
      const existingItem = state.cart.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }
    case actionTypes.UPDATE_QUANTITY: {
      return {
        ...state,
        cart: state.cart
          .map((item) =>
            item.id === action.payload.itemId
              ? { ...item, quantity: item.quantity + action.payload.delta }
              : item
          )
          .filter((item) => item.quantity > 0), // Remove item if quantity is 0
      };
    }
    // --- NEW: Clear Cart Action ---
    case actionTypes.CLEAR_CART:
        return {
            ...state,
            cart: [],
        };

    // --- Admin Menu Item Actions ---
    case actionTypes.ADD_MENU_ITEM:
      return {
        ...state,
        foodItems: [...state.foodItems, action.payload],
      };
    case actionTypes.EDIT_MENU_ITEM:
      return {
        ...state,
        foodItems: state.foodItems.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case actionTypes.DELETE_MENU_ITEM:
      return {
        ...state,
        foodItems: state.foodItems.filter(
          (item) => item.id !== action.payload
        ),
      };
    default:
      return state;
  }
};
