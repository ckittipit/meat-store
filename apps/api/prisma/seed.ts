import { PrismaClient, ProductType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const products = [
        {
            name: 'เนื้อทอดพร้อมทาน',
            slug: 'fried-beef-ready',
            description:
                'เนื้อทอดหอม ๆ พร้อมทาน เหมาะกับข้าวเหนียว ข้าวสวย หรือทานเล่น',
            imageUrl: '/products/fried-beef-ready.jpg',
            price: 120,
            type: ProductType.READY_TO_EAT,
        },
        {
            name: 'เนื้อแดดเดียวทอดพร้อมทาน',
            slug: 'fried-sundried-beef-ready',
            description:
                'เนื้อแดดเดียวทอดพร้อมทาน รสเข้ม เคี้ยวมัน หอมกลิ่นเนื้อ',
            imageUrl: '/products/fried-sundried-beef-ready.jpg',
            price: 140,
            type: ProductType.READY_TO_EAT,
        },
        {
            name: 'เนื้อหมักไม่ทอด',
            slug: 'marinated-beef-raw',
            description: 'เนื้อหมักสูตรพิเศษแบบไม่ทอด สำหรับนำไปทอดเองที่บ้าน',
            imageUrl: '/products/marinated-beef-raw.jpg',
            price: 110,
            type: ProductType.RAW_MARINATED,
        },
        {
            name: 'เนื้อแดดเดียวไม่ทอด',
            slug: 'sundried-beef-raw',
            description:
                'เนื้อแดดเดียวแบบไม่ทอด พร้อมนำไปทอดเอง เก็บง่าย ทำทานสะดวก',
            imageUrl: '/products/sundried-beef-raw.jpg',
            price: 130,
            type: ProductType.RAW_SUNDRIED,
        },
    ];

    for (const product of products) {
        await prisma.product.upsert({
            where: {
                slug: product.slug,
            },
            update: {
                name: product.name,
                description: product.description,
                imageUrl: product.imageUrl,
                price: product.price,
                type: product.type,
                isActive: true,
            },
            create: product,
        });
    }

    console.log('Seed product completed');
}

main()
    .catch((error) => {
        console.error('Seed failed', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
