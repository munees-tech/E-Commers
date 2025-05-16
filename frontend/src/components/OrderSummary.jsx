import { MoveRight } from "lucide-react";
import { useCartStore } from '../stores/useCartStroe.js';
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "../lib/axios.js";
import { useUserStore } from "../stores/useUserStore.js";

const OrderSummary = () => {
	const { user } = useUserStore()
	const { total, subtotal, coupon, cart,  iscouponApplied } = useCartStore();
	const savings = total - subtotal;
	const formattedTotal = total.toFixed(2);
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedSavings = savings.toFixed(2)

	 const ensureRazorpay = () => {
	return new Promise((resolve, reject) => {
		if (typeof window.Razorpay === "function") {
			try {
				
				new window.Razorpay({ key: "test" });
				resolve(true);
				return;
			} catch (err) {
				console.warn("⚠️ Razorpay corrupted, reloading...");
			}
		}
	
		const oldScript = document.querySelector('script[src*="checkout.razorpay.com"]');
		if (oldScript) oldScript.remove();

		
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.onload = () => {
			if (typeof window.Razorpay === "function") resolve(true);
			else reject("Razorpay failed to load.");
		};
		script.onerror = () => reject("Razorpay script failed to load.");
		document.body.appendChild(script);
	});
};
const handlePayment = async () => {
	try {
		await ensureRazorpay();

		const res = await axios.post("/payments/create-payment", {
			products: cart.map((item) => ({
				productId: item._id,
				quantity: item.quantity,
			})),
			couponCode: coupon?.code || null,
		});

		const options = {
			key: "rzp_test_FoJQxJhEWdQhz2",
			amount: res.data.amount,
			currency: res.data.currency,
			name: "E-Commers",
			description: "Order Payment",
			order_id: res.data.orderId,
			handler: async (response) => {
				await axios.post("/payments/checkout-success", {
					razorpay_order_id: response.razorpay_order_id,
					razorpay_payment_id: response.razorpay_payment_id,
					razorpay_signature: response.razorpay_signature,
					metadata: {
						products: JSON.stringify(cart.map((item) => ({
							id: item._id,
							quantity: item.quantity,
							price: item.product.price,
						}))),
						couponCode: coupon?.code || null,
						userId: user._id,
						totalAmount: res.data.amount / 100,
					},
				});
				navigate("/purchase-success");
			},
			prefill: {
				name: user.name,
				email: user.email,
			},
			theme: {
				color: "#10B981",
			},
		};

		new window.Razorpay(options).open();

	} catch (error) {
		console.error("Payment error:", error);
		alert("⚠️ Payment failed. Try refreshing the page.");
	}
};


	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-emerald-400'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>₹{formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-emerald-400'>-₹{formattedSavings}</dd>
						</dl>
					)}

					{coupon &&  iscouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-emerald-400'>₹{formattedTotal}</dd>
					</dl>
				</div>

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handlePayment}
				>
					Proceed to Checkout
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
}

export default OrderSummary