type BaseResponse<T> = {
    meta: {
        success: boolean;
        error: string;
    }
    data?: T;
}