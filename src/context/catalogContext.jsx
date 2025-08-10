"use client";

import { createContext, useContext, useReducer, useMemo } from "react";
import { catalogReducer, initialState, actionTypes } from "./catalogReducer";

const categories = ["All Menu", "Foods", "Beverages", "Dessert"];

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);

  // --- Handler functions ---
  const handleAddToCart = (itemToAdd) => dispatch({ type: actionTypes.ADD_TO_CART, payload: itemToAdd });
  const handleUpdateQuantity = (itemId, delta) => dispatch({ type: actionTypes.UPDATE_QUANTITY, payload: { itemId, delta } });
  const setSearch = (searchTerm) => dispatch({ type: actionTypes.SET_SEARCH, payload: searchTerm });
  const setSelectedCategory = (category) => dispatch({ type: actionTypes.SET_CATEGORY, payload: category });
  const handleAddMenuItem = (newItem) => dispatch({ type: actionTypes.ADD_MENU_ITEM, payload: newItem });
  const handleEditMenuItem = (updatedItem) => dispatch({ type: actionTypes.EDIT_MENU_ITEM, payload: updatedItem });
  
  // --- NEW DELETE FUNCTION ---
  const handleDeleteMenuItem = (itemId) => {
    dispatch({ type: actionTypes.DELETE_MENU_ITEM, payload: itemId });
  };

  const filteredItems = useMemo(() => {
    return state.foodItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(state.search.toLowerCase());
      const matchesCategory = state.selectedCategory === "All Menu" || item.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.search, state.selectedCategory, state.foodItems]);

  const value = {
    cart: state.cart,
    search: state.search,
    selectedCategory: state.selectedCategory,
    categories,
    filteredItems,
    setSearch,
    setSelectedCategory,
    handleAddToCart,
    handleUpdateQuantity,
    handleAddMenuItem,
    handleEditMenuItem,
    handleDeleteMenuItem, // Expose the new delete function
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error("useCatalog must be used within a CatalogProvider");
  }
  return context;
};
