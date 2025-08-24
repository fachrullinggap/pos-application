"use client";

// FIX 1: Add useEffect and useCallback to imports
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

  // OPTIMIZATION 2: Wrap handler functions in useCallback
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
  
  const handleAddMenuItem = useCallback(
    async (formData) => {
      // Dispatch a loading state if you want to show a spinner
      // dispatch({ type: actionTypes.SET_LOADING, payload: true });

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/create`,
          {
            method: "POST",
            headers: {
              // IMPORTANT: Do NOT set 'Content-Type'.
              // The browser will automatically set it to 'multipart/form-data'
              // with the correct boundary when the body is a FormData object.
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to add new item.");
        }

        const result = await response.json();
        
        // Dispatch the new item returned from the API to update the local state
        dispatch({
          type: actionTypes.ADD_MENU_ITEM,
          payload: result.data, // Assuming the API returns the new item in a 'data' property
        });

        return { success: true }; // Return success status to the component

      } catch (error) {
        console.error("Error adding menu item:", error);
        // Optionally dispatch an error to the reducer
        // dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        return { success: false, error: error.message }; // Return error status
      }
    },
    [userToken] // Add userToken as a dependency
  );

  const handleEditMenuItem = useCallback(
    async (itemId, formData) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/edit-product/${itemId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Gagal merubah produk.");
        }

        const result = await response.json();

        // Dispatch the updated item returned from the API
        dispatch({
          type: actionTypes.EDIT_MENU_ITEM,
          payload: result.data, // Assuming the API returns the updated item in 'data'
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
    // (itemId) =>
    //   dispatch({ type: actionTypes.DELETE_MENU_ITEM, payload: itemId }),
    // []

    async (itemId) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/delete/${itemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
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
        console.error("Error updating menu item:", error);
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

  // OPTIMIZATION 1 & 3: Memoize the context value and simplify it
  const value = useMemo(
    () => ({
      state, // Provide the whole state object
      categories,
      filteredItems,
      // Provide the memoized handler functions
      setSearch,
      setSelectedCategory,
      handleAddToCart,
      handleUpdateQuantity,
      handleAddMenuItem,
      handleEditMenuItem,
      handleDeleteMenuItem,
    }),
    [
      state,
      categories,
      filteredItems,
      setSearch,
      setSelectedCategory,
      handleAddToCart,
      handleUpdateQuantity,
      handleAddMenuItem,
      handleEditMenuItem,
      handleDeleteMenuItem,
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
