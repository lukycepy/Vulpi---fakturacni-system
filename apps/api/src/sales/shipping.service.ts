import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Mock: Create Shipping Label via Packeta API
   */
  async createPacketaLabel(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true, organization: true }
    });

    if (!order) throw new Error('Order not found');

    this.logger.log(`Creating Packeta label for Order ${order.orderNumber}`);

    // In real app: Call Packeta API (createPacket)
    // Payload: recipient, address, weight, value...
    
    // Mock Response
    const mockTrackingNumber = `Z${Math.floor(Math.random() * 1000000000)}`;
    const mockLabelUrl = `https://example.com/labels/${mockTrackingNumber}.pdf`;

    // Save to Order
    await this.prisma.order.update({
        where: { id: orderId },
        data: {
            carrier: 'packeta',
            trackingNumber: mockTrackingNumber,
            shippingLabelUrl: mockLabelUrl,
            status: 'shipped' // Update status
        }
    });

    return {
        success: true,
        trackingNumber: mockTrackingNumber,
        labelUrl: mockLabelUrl
    };
  }
}
