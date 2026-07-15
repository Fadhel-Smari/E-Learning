import axios from 'axios'

export const pokeapi = axios.create({
    baseURL: 'https://opentdb.com/api.php?amount=5&type=multiple',
    timeout: 5000,
})