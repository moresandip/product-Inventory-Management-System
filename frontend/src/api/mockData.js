export const MOCK_PRODUCTS = [
    {
        id: 1,
        name: 'Wireless Headphones',
        unit: 'pcs',
        category: 'Electronics',
        brand: 'SoundWave',
        stock: 45,
        status: 'In Stock',
        image: '',
    },
    {
        id: 2,
        name: 'Ergonomic Office Chair',
        unit: 'pcs',
        category: 'Furniture',
        brand: 'ComfortSeating',
        stock: 12,
        status: 'In Stock',
        image: '',
    },
    {
        id: 3,
        name: 'Organic Green Tea',
        unit: 'box',
        category: 'Groceries',
        brand: 'NatureBrew',
        stock: 0,
        status: 'Out of Stock',
        image: '',
    },
    {
        id: 4,
        name: 'Running Shoes',
        unit: 'pair',
        category: 'Footwear',
        brand: 'SpeedRunner',
        stock: 28,
        status: 'In Stock',
        image: '',
    },
    {
        id: 5,
        name: 'Smartphone Stand',
        unit: 'pcs',
        category: 'Electronics',
        brand: 'TechGear',
        stock: 150,
        status: 'In Stock',
        image: '',
    },
];

export const MOCK_CATEGORIES = ['Electronics', 'Furniture', 'Groceries', 'Footwear', 'Clothing'];

export const getMockData = (url, method) => {
    if (url.includes('/products/search')) {
        return MOCK_PRODUCTS;
    }
    if (url.includes('/products/categories')) {
        return MOCK_CATEGORIES;
    }
    if (url.includes('/products') && method === 'get') {
        return {
            products: MOCK_PRODUCTS,
            pagination: {
                page: 1,
                limit: 10,
                total: MOCK_PRODUCTS.length,
                pages: 1,
            },
        };
    }
    if (url.includes('/history')) {
        return [];
    }
    return {};
};
