import { useEffect, useState } from 'react';
import axios from '../lib/axios';
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from './ProductCard';

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendition] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const featuredProducts = async () => {
      try {
        const res = await axios.get("/products/recommendations");
        setRecommendition(res.data);
        setLoading(false)
      } catch (error) {
        toast.error(error.message || "Failed To Fetch FeturedProducts");
      } finally {
        setLoading(false);
      };
    }
    featuredProducts();
  }, []);

  if(loading){
    return <LoadingSpinner />
  };

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default PeopleAlsoBought;