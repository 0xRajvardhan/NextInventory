import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categoriesData = [
    {name: 'Aire Acondicionado & Calefacción'},
    {name: 'Toma De Aire'},
    {name: 'Sistema De Aire'},
    {name: 'Carroceria'},
    {name: 'Frenos, Extremo De La Rueda & Neumáticos'},
    {name: 'Cabina & Cromo'},
    {name: 'Químicos'},
    {name: 'Sistema De Refrigeración'},
    {name: 'Transmisión'},
    {name: 'Motor'},
    {name: 'Escape'},
    {name: 'Sistema De Combustible'},
    {name: 'Hidráulica & PTO'},
    {name: 'Iluminación'},
    {name: 'Lubricación & Filtración'},
    {name: 'Arranque, Carga & Sistema Electrico'},
    {name: 'Suspensión & Dirección'},
    {name: 'Herramientas, Seguridad & Suministros'},
    {name: 'Piezas De Remolque'}
  ];

  for (const categoryData of categoriesData) {
    await prisma.categories.create({
      data: {
        name: categoryData.name,
      },
    });
  }

  const warehousesData = [
    { name: 'Warehouse 1'},
    { name: 'Warehouse 2'},
    // Add more warehouses as needed
  ];

  for (const warehouseData of warehousesData) {
    await prisma.warehouse.create({
      data: {
        name: warehouseData.name,
      },
    });
  }


  
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });