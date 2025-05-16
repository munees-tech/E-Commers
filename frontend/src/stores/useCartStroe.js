import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    iscouponApplied: false,

    getcoupon: async () => {
        try {
            const res = await axios.get("/coupon");
            set({ coupon: res.data })
        } catch (error) {
            toast.error(error.message);
        }
    },

    applyCoupon: async (code) => {
        try {
            const res = await axios.post("/coupon/validate", { code });
            set({ coupon: res.data, iscouponApplied: true });
            console.log(set)
            get().calculateTotals();
            toast.success("Coupon applied succesfully")
        } catch (error) {
            toast.error(error.message);
        }
    },

    removeCoupon: () => {
        set({ coupon: null, iscouponApplied: false });
        get().calculateTotals();
        toast.success("coupon removed succesfully")
    },

    getCartItem: async () => {
        try {
            const res = await axios.get("/cart");
            set({ cart: res.data });
            get().calculateTotals();
        } catch (error) {
            toast.error(error.message || "Failed To Load GetCartItem");
        }
    },



    removeFromCart: async (productId) => {
        try {
            await axios.delete(`/cart`, { data: { productId } });
            set((prevState) => ({
                cart: prevState.cart.filter((item) => item._id !== productId),
            }));
            await get().calculateTotals();
            toast.success("Product removed from cart");
        } catch (error) {
            toast.error(error.message);
        }
    },

    updateQuantity: async (productId, quantity) => {
        if (quantity === 0) {
            get().removeFromCart(productId);
            return;
        }

        await axios.put(`/cart/${productId}`, { quantity });
        set((prevState) => ({
            cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
        }));
        get().calculateTotals();
    },

    addToCart: async (product) => {
        try {
            const res = await axios.post("/cart", { productId: product._id });
            toast.success("Product Added To Cart");
            set((prevprevState) => {
                const existingItem = prevprevState.cart.find((item) => item._id === product._id);
                const updatedCart = existingItem
                    ? prevprevState.cart.map((item) =>
                        item._id === product._id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    )
                    : [...prevprevState.cart, { ...product, quantity: 1 }];

                return { cart: updatedCart };
            });
            get().calculateTotals();
        } catch (error) {
            toast.error(error.message || "Failed to add product to cart");
        }
    },

    calculateTotals: async () => {
        const { cart, coupon } = get();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;
        if (coupon) {
            const discount = subtotal * (coupon.discountPercentage / 100);
            total = subtotal - discount;
        }
        set({ subtotal, total });
    },
}));