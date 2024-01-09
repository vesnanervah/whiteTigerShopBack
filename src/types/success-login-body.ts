type SuccessLoginBody = {
    token: string,
    email: string | null,
    name: string | null,
    adress: string | null,
    balance: number
};
 
export {SuccessLoginBody};