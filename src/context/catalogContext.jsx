"use client";

import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { catalogReducer, initialState, actionTypes } from "./catalogReducer";
import { useAuth } from "@/context/authContext";

const categories = ["All Menu", "Foods", "Beverages", "Dessert"];

const CatalogContext = createContext();

export const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialState);
  const { userToken } = useAuth();

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userToken) {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
        return;
      }
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/get-products`,
          { headers: { Authorization: `Bearer ${userToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch products.");
        const data = await response.json();
        dispatch({
          type: actionTypes.SET_FOOD_ITEMS,
          payload: data.data || [],
        });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        console.error(error);
      }
    };
    fetchProducts();
  }, [userToken]);

  // --- Memoized Handler Functions ---
  const handleAddToCart = useCallback(
    (itemToAdd) =>
      dispatch({ type: actionTypes.ADD_TO_CART, payload: itemToAdd }),
    []
  );
  const handleUpdateQuantity = useCallback(
    (itemId, delta) =>
      dispatch({
        type: actionTypes.UPDATE_QUANTITY,
        payload: { itemId, delta },
      }),
    []
  );
  const handleClearCart = useCallback(
    () => dispatch({ type: actionTypes.CLEAR_CART }),
    []
  );
  const setSearch = useCallback(
    (searchTerm) =>
      dispatch({ type: actionTypes.SET_SEARCH, payload: searchTerm }),
    []
  );
  const setSelectedCategory = useCallback(
    (category) =>
      dispatch({ type: actionTypes.SET_CATEGORY, payload: category }),
    []
  );
  
  // --- CRUD Functions for Admin ---
  const handleAddMenuItem = useCallback(
    async (formData) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/create`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${userToken}` },
            body: formData,
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add new item.");
        }
        const result = await response.json();
        dispatch({
          type: actionTypes.ADD_MENU_ITEM,
          payload: result.data,
        });
        return { success: true };
      } catch (error) {
        console.error("Error adding menu item:", error);
        return { success: false, error: error.message };
      }
    },
    [userToken]
  );

  const handleEditMenuItem = useCallback(
    async (itemId, formData) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/edit-product/${itemId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${userToken}` },
            body: formData,
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal merubah produk.");
        }
        const result = await response.json();
        dispatch({
          type: actionTypes.EDIT_MENU_ITEM,
          payload: result.data,
        });
        return { success: true, message: result.message };
      } catch (error) {
        console.error("Error updating menu item:", error);
        return { success: false, error: error.message };
      }
    },
    [userToken]
  );

  const handleDeleteMenuItem = useCallback(
    async (itemId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/delete/${itemId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${userToken}` },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal menghapus produk.");
        }
        const result = await response.json();
        dispatch({
          type: actionTypes.DELETE_MENU_ITEM,
          payload: itemId,
        });
        return { success: true, message: result.message };
      } catch (error) {
        console.error("Error deleting menu item:", error);
        return { success: false, error: error.message };
      }
    },
    [userToken]
  );

  // --- NEW: Function to handle order creation ---
  const handleCreateOrder = useCallback(
    async (orderData) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/order/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify(orderData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create order.");
        }

        const result = await response.json();
        
        // After successful order, clear the cart
        dispatch({ type: actionTypes.CLEAR_CART });

        return { success: true, message: "Order created successfully!", data: result.data };
      } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
      }
    },
    [userToken]
  );


  // --- Memoized Filtering ---
  const filteredItems = useMemo(() => {
    return state.foodItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(state.search.toLowerCase());
      const matchesCategory =
        state.selectedCategory === "All Menu" ||
        item.category === state.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.search, state.selectedCategory, state.foodItems]);

  const value = useMemo(
    () => ({
      state,
      categories,
      filteredItems,
      setSearch,
      setSelectedCategory,
      handleAddToCart,
      handleUpdateQuantity,
      handleClearCart, // <-- Export clear cart function
      handleAddMenuItem,
      handleEditMenuItem,
      handleDeleteMenuItem,
      handleCreateOrder, // <-- Export new order function
    }),
    [
      state,
      filteredItems,
      setSearch,
      setSelectedCategory,
      handleAddToCart,
      handleUpdateQuantity,
      handleClearCart,
      handleAddMenuItem,
      handleEditMenuItem,
      handleDeleteMenuItem,
      handleCreateOrder,
    ]
  );

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
