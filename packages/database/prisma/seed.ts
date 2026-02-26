import { PrismaClient, InvoiceRole, InvoiceStatus, InvoiceType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('1234', 10);

  // 1. Users
  
  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vulpi.cz' },
    update: { passwordHash, role: Role.SUPERADMIN },
    create: {
      email: 'admin@vulpi.cz',
      username: 'admin',
      name: 'Super Admin',
      passwordHash,
      role: Role.SUPERADMIN,
    },
  });

  // Dual Login User
  const testUser = await prisma.user.upsert({
    where: { email: 'test@test.com' },
    update: { passwordHash, username: 'test', role: Role.SUPERADMIN },
    create: {
      email: 'test@test.com',
      username: 'test',
      name: 'Dual Login User',
      passwordHash,
      role: Role.SUPERADMIN,
    },
  });

  // Worker
  const worker = await prisma.user.upsert({
    where: { email: 'worker@vulpi.cz' },
    update: { passwordHash, role: Role.USER },
    create: {
      email: 'worker@vulpi.cz',
      username: 'worker',
      name: 'Omezený Zaměstnanec',
      passwordHash,
      role: Role.USER,
    },
  });

  // Client User
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@firma.cz' },
    update: { passwordHash, role: Role.CLIENT },
    create: {
      email: 'client@firma.cz',
      username: 'client',
      name: 'Klient s přístupem',
      passwordHash,
      role: Role.CLIENT,
    },
  });

  // 2. Organizations
  
  const org1 = await prisma.organization.upsert({
    where: { ico: '12345678' },
    update: {},
    create: {
      name: 'Vulpi Software s.r.o.',
      ico: '12345678',
      dic: 'CZ12345678',
      vatPayer: true,
      inboxEmail: 'faktury@vulpi.cz',
    },
  });

  const org2 = await prisma.organization.upsert({
    where: { ico: '87654321' },
    update: {},
    create: {
      name: 'Vokurka Export a.s.',
      ico: '87654321',
      dic: 'CZ87654321',
      vatPayer: true,
    },
  });

  // Memberships
  
  // Admin -> Org1 (Owner)
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: admin.id, organizationId: org1.id } },
    update: {},
    create: {
      userId: admin.id,
      organizationId: org1.id,
      role: InvoiceRole.owner,
    },
  });

  // Test User -> Org2 (Owner)
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: testUser.id, organizationId: org2.id } },
    update: {},
    create: {
      userId: testUser.id,
      organizationId: org2.id,
      role: InvoiceRole.owner,
    },
  });

  // Worker -> Org1 (Restricted)
  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: worker.id, organizationId: org1.id } },
    update: {
        permissions: {
            canViewReports: false,
            canViewInvoices: false,
            canManageTime: true,
            canViewStock: true
        }
    },
    create: {
      userId: worker.id,
      organizationId: org1.id,
      role: InvoiceRole.editor,
      permissions: {
          canViewReports: false,
          canViewInvoices: false,
          canManageTime: true,
          canViewStock: true
      }
    },
  });

  // Client User -> Client for Org1
  // First create Client entity in Org1
  // We need to verify if Client already exists or upsert it
  // Since Client doesn't have a unique field except ID (and composition of organizationId + name? No),
  // We'll search by name and organizationId
  
  const existingClient = await prisma.client.findFirst({
      where: { organizationId: org1.id, email: 'klient@seznam.cz' }
  });

  let clientEntityId = existingClient?.id;

  if (!existingClient) {
      const newClient = await prisma.client.create({
          data: {
              organizationId: org1.id,
              name: 'Externí Klient s.r.o.',
              email: 'klient@seznam.cz',
              ico: '11111111',
          }
      });
      clientEntityId = newClient.id;
  }

  // 3. Products
  const productsData = [
      { name: 'Notebook', price: 25000, ean: '111222333' },
      { name: 'Myš', price: 500, ean: '444555666' },
      { name: 'Monitor', price: 5000, ean: '777888999' }
  ];

  for (const p of productsData) {
      await prisma.product.create({
          data: {
              organizationId: org1.id,
              name: p.name,
              unitPrice: p.price,
              vatRate: 21,
              ean: p.ean,
              currentStock: 10,
          }
      });
  }

  // 4. Invoices
  const statuses = [InvoiceStatus.paid, InvoiceStatus.overdue, InvoiceStatus.draft, InvoiceStatus.sent, InvoiceStatus.paid];
  
  if (clientEntityId) {
    for (let i = 0; i < 5; i++) {
        const invoiceNum = `202400${i+1}`;
        // Check if invoice exists
        const exists = await prisma.invoice.findUnique({
            where: { invoiceNumber_organizationId: { invoiceNumber: invoiceNum, organizationId: org1.id } }
        });

        if (!exists) {
            await prisma.invoice.create({
                data: {
                    organizationId: org1.id,
                    clientId: clientEntityId,
                    invoiceNumber: invoiceNum,
                    issueDate: new Date(),
                    taxableSupplyDate: new Date(),
                    dueDate: new Date(),
                    totalAmount: 1000 * (i+1),
                    totalVat: 210 * (i+1),
                    status: statuses[i],
                    currency: i === 4 ? 'EUR' : 'CZK',
                    exchangeRate: i === 4 ? 25.5 : 1,
                    items: {
                        create: {
                            description: 'Služby',
                            quantity: 1,
                            unitPrice: 1000 * (i+1),
                            totalPrice: 1000 * (i+1),
                            vatRate: 21,
                            vatAmount: 210 * (i+1),
                        }
                    }
                }
            });
        }
    }
  }

  // 5. CRM Deal
  const stageName = 'Vyjednávání';
  let stage = await prisma.dealStage.findFirst({
      where: { organizationId: org1.id, name: stageName }
  });

  if (!stage) {
      stage = await prisma.dealStage.create({
          data: {
              organizationId: org1.id,
              name: stageName,
              order: 1
          }
      });
  }

  await prisma.deal.create({
      data: {
          organizationId: org1.id,
          clientId: clientEntityId,
          stageId: stage.id,
          title: 'Velký obchod',
          value: 100000,
          status: 'OPEN'
      }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
