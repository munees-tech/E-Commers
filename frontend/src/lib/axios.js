import axios from "axios";
import { baseURL} from "../lib/url.js"
const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true // send the cokkie to the server
});

export default axiosInstance;