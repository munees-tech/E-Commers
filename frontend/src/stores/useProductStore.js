import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useProductStore = create((set) => ({
    products: [],
    loading: false,

    createProduct: async (productData) => {
        set({ loading: true });
        try {
            const res = await axios.post("/products", productData);
            set((state) => ({
                products: [...state.products, res.data],
                loading: false,
            }));
            toast.success("Product created successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create product");
            set({ loading: false });
        }
    },

    catogeryProducts: async (category) => {
        set({ loading: true })
        try {
            const res = await axios.get(`/products/category/${category}`);
            set({ products: res.data.products, loading: false })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Catogery products");
            set({ loading: false });
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true })
        try {
            const res = await axios.get("/products")
            set({ products: res.data.products, loading: false })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Fetch Products");
            set({ loading: false });
        }
    },

    deleteProduct: async (productId) => {
        set({ loading: true })
        try {
            const res = await axios.delete(`/products/${productId}`);
            set((prevProducts) => ({
                products: prevProducts.products.filter((product) => product._id !== productId),
                loading: false
            }))
            toast.success("Product Deleted Succesfully")
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Delete Product");
            set({ loading: false });
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({ loading: true })
        try {
            const res = await axios.patch(`products/${productId}`)
            console.log(res)
            set((state) => ({
                products: state.products.map((product) =>
                    product._id === productId ? { ...product, isFeatured: res.data.isFeatured } : product
                ),
                loading: false,
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to Featured Products");
            set({ loading: false });
        }
    },

    fetchFeaturedProducts: async () => {
        set({ loading: true });
        try {
            const res = await axios.get("/products/featured");
            set({ products: res.data, loading: false });

        } catch (error) {
            toast.error(error.message || "Something went wrong");
        };
    }
}));