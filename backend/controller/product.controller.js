import { Redies} from "../lib/redies.js";
import Product from "../model/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({}); // Get All Products
        res.status(200).json({ products });
    } catch (error) {
        console.error(`Error in getAllProducts Controller: ${error}`);
        res.status(500).json({ message: "Server error while fetching products" });
    }
};

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProduct = await Redies.get("featured_products");
        if (featuredProduct) {
            return res.status(200).json(JSON.parse(featuredProduct));
        }

        featuredProduct = await Product.find({ isFeatured: true }).lean();
        if (!featuredProduct || featuredProduct.length === 0) {
            return res.status(404).json({ message: "No Featured Products" });
        }

        await Redis.set("featured_products", JSON.stringify(featuredProduct));
        res.status(200).json(featuredProduct);
    } catch (error) {
        console.error(`Error in getFeaturedProducts: ${error}`);
        res.status(500).json({ message: "Server error" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { name, descripition, price, image, category } = req.body;
        let cloudinaryResponse = null;

        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        const product = new Product({
            name,
            descripition,
            price,
            image: cloudinaryResponse?.secure_url || "",
            category,
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error(`Error in createProduct Controller: ${error}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product Not Found" });
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`);
                console.log("Product image deleted successfully");
            } catch (error) {
                console.error(`Error deleting product image: ${error}`);
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(`Error in deleteProduct Controller: ${error}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllRecommendation = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 4 } },
            {
                $project: {
                    id: 1,
                    name: 1,
                    descripition: 1,
                    image: 1,
                    price: 1,
                },
            },
        ]);
        res.status(200).json(products);
    } catch (error) {
        console.error(`Error in getAllRecommendation Controller: ${error}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCatogroyProducts = async (req, res) => {
    const { category } = req.params;
    try {
        const products = await Product.find({ category });
        res.status(200).json({products});
    } catch (error) {
        console.error(`Error in getCatogroyProducts Controller: ${error}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const toogleFeaturedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        const updatedProduct = await product.save();
        await updateFeaturedProductsCache();
        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error(`Error in toogleFeaturedProducts Controller: ${error}`);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

async function updateFeaturedProductsCache() {
    try {
        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        await Redies.set("featured_products", JSON.stringify(featuredProducts));
    } catch (error) {
        console.error(`Error in updateFeaturedProductsCache: ${error}`);
    }
}