import Product from "../model/product.model.js";

export const getCartProducts = async (req, res) => {
	try {
		const products = await Product.find({ _id: { $in: req.user.cartItem } });
		// add quantity for each product
		const cartItems = products.map((product) => {
			const item = req.user.cartItem.find((cartItem) => cartItem.id === product.id);
			return { ...product.toJSON(), quantity: item.quantity };
		});

		res.json(cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


export const addToCart = async (req, res) => {
    try {
      const { productId } = req.body;
      const user = req.user;

      const existingItem = user.cartItem.find(
        item => item.id === productId
      );
  
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
       user.cartItem.push(productId);
      }
  
      await user.save();
      res.status(200).json(user.cartItems);
    } catch (error) {
      console.log(`Error in addToCartController: ${error}`);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
};
  
export const removeFromCart = async (req, res) => {
    try {
        const { id:productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItem = [];
        } else {
            user.cartItem = user.cartItem.filter(
                (item) => item._id.toString() !== productId
            );
        }
        await user.save();

        res.status(200).json(user.cartItem);
    } catch (error) {
        console.log(`Error in removeFromCartController: ${error}`);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const updateQuantity = async (req, res) => {
	try {
		const { id:productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItem.find((item) => item.id === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItem = user.cartItem.filter((item) => item.id !== productId);
				await user.save();
				return res.json(user.cartItem);
			}

			existingItem.quantity = quantity;
			await user.save();
			res.json(user.cartItem);
		} else {
			res.status(404).json({ message: "Product not found" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};