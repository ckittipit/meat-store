import { PrismaClient, ProductSize, ProductType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

type SeedProduct = {
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    type: ProductType;
    variants: {
        size: ProductSize;
        label: string;
        grams: number;
        price: number;
    }[];
};

const products: SeedProduct[] = [
    {
        name: 'เนื้อทอดพร้อมทาน',
        slug: 'fried-beef-ready',
        description:
            'เนื้อทอดหอม ๆ พร้อมทาน เหมาะกับข้าวเหนียว ข้าวสวย หรือทานเล่น',
        imageUrl: '/products/fried-beef-ready.jpg',
        type: ProductType.READY_TO_EAT,
        variants: [
            {
                size: ProductSize.SIZE_100G,
                label: '100g',
                grams: 100,
                price: 120,
            },
            {
                size: ProductSize.SIZE_500G,
                label: '500g',
                grams: 500,
                price: 550,
            },
            {
                size: ProductSize.SIZE_1KG,
                label: '1kg',
                grams: 1000,
                price: 1000,
            },
        ],
    },
    {
        name: 'เนื้อแดดเดียวทอดพร้อมทาน',
        slug: 'fried-sundried-beef-ready',
        description: 'เนื้อแดดเดียวทอดพร้อมทาน รสเข้ม เคี้ยวมัน หอมกลิ่นเนื้อ',
        imageUrl: '/products/fried-sundried-beef-ready.jpg',
        type: ProductType.READY_TO_EAT,
        variants: [
            {
                size: ProductSize.SIZE_100G,
                label: '100g',
                grams: 100,
                price: 140,
            },
            {
                size: ProductSize.SIZE_500G,
                label: '500g',
                grams: 500,
                price: 650,
            },
            {
                size: ProductSize.SIZE_1KG,
                label: '1kg',
                grams: 1000,
                price: 1200,
            },
        ],
    },
    {
        name: 'เนื้อหมักไม่ทอด',
        slug: 'marinated-beef-raw',
        description: 'เนื้อหมักสูตรพิเศษแบบไม่ทอด สำหรับนำไปทอดเองที่บ้าน',
        imageUrl: '/products/marinated-beef-raw.jpg',
        type: ProductType.RAW_MARINATED,
        variants: [
            {
                size: ProductSize.SIZE_100G,
                label: '100g',
                grams: 100,
                price: 110,
            },
            {
                size: ProductSize.SIZE_500G,
                label: '500g',
                grams: 500,
                price: 500,
            },
            {
                size: ProductSize.SIZE_1KG,
                label: '1kg',
                grams: 1000,
                price: 950,
            },
        ],
    },
    {
        name: 'เนื้อแดดเดียวไม่ทอด',
        slug: 'sundried-beef-raw',
        description:
            'เนื้อแดดเดียวแบบไม่ทอด พร้อมนำไปทอดเอง เก็บง่าย ทำทานสะดวก',
        imageUrl: '/products/sundried-beef-raw.jpg',
        type: ProductType.RAW_SUNDRIED,
        variants: [
            {
                size: ProductSize.SIZE_100G,
                label: '100g',
                grams: 100,
                price: 130,
            },
            {
                size: ProductSize.SIZE_500G,
                label: '500g',
                grams: 500,
                price: 600,
            },
            {
                size: ProductSize.SIZE_1KG,
                label: '1kg',
                grams: 1000,
                price: 1100,
            },
        ],
    },
];

async function main() {
    for (const product of products) {
        const startingPrice =
            product.variants.find(
                (variant) => variant.size === ProductSize.SIZE_100G,
            )?.price ?? product.variants[0].price;

        const savedProduct = await prisma.product.upsert({
            where: {
                slug: product.slug,
            },
            update: {
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                price: startingPrice,
                type: product.type,
                isActive: true,
            },
            create: {
                name: product.name,
                slug: product.slug,
                description: product.description,
                imageUrl: product.imageUrl,
                price: startingPrice,
                type: product.type,
                isActive: true,
            },
        });

        for (const variant of product.variants) {
            await prisma.productVariant.upsert({
                where: {
                    productId_size: {
                        productId: savedProduct.id,
                        size: variant.size,
                    },
                },
                update: {
                    label: variant.label,
                    grams: variant.grams,
                    price: variant.price,
                    isActive: true,
                },
                create: {
                    productId: savedProduct.id,
                    size: variant.size,
                    label: variant.label,
                    grams: variant.grams,
                    price: variant.price,
                    isActive: true,
                },
            });
        }
    }

    console.log('Seed products and variants completed');
}

main()
    .catch((error) => {
        console.error('Seed failed');
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
