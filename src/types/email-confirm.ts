type EmailConfirmInitBody = {
    email: string
};

type EmailConfirmByCodeBody = {
    email: string,
    code: string
}

export {EmailConfirmInitBody, EmailConfirmByCodeBody};