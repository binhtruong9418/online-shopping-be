export enum APP_ROLES {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum ORDER_STATUS {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    CONFIRMED = 'CONFIRMED',
    REFUNDED = 'REFUNDED',
    DELIVERING = 'DELIVERING',
    DELIVERED = 'DELIVERED',
}

export enum PAYMENT_METHOD {
    COD = 'cod',
    VNPAY = 'vnpay',
}
