import axios from 'axios';


//export const BASE_URL = "/api/v1"

export const BASE_URL = process.env.NODE_ENV==="production"? `/api/v1`:"http://localhost:8080/api/v1"

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

export default axiosClient