export function zError(message: string): never{
    alert(message)
    throw new Error(message)
}
