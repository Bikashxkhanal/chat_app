export * from './api/ApiError'
export * from './api/ApiResponse'

export function formatDate(date : Date) : string {
    return new Date(date).toLocaleDateString('en-US') 
}

export function slugify(text:string): string {
    return text.toLowerCase().replace("/\s+/g", "_");
}

