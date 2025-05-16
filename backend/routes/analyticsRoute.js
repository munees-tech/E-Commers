import express from "express";
import { adminRoute, productRoute } from "../middlewere/auth.middlewere.js";
import { getAnalyticsData, getDailySalesData } from "../controller/analytical.controller.js";

const router = express.Router();

router.get("/", productRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData(); 
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.status(200).json({
      analyticsData,   
      dailySalesData
    });
  } catch (error) {
    console.log(`Error in analytical controller ${error}`);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;
