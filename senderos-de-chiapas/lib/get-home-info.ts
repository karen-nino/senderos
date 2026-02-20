import { query } from './strapi'

export async function getHomeInfo() {
    return query('home')
    .then(res => {
        console.log(res)
        return res
    })
}