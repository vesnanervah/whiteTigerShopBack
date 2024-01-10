import { User } from "./user";

type SuccessLoginBody = {
    token: string,
    user: User,
};
 
export {SuccessLoginBody};