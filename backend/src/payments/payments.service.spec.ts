import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaytechService } from './paytech.service';
import { Payment, PaymentStatus } from './payment.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/booking.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('PaymentsService - IPN Handling', () => {
  let service: PaymentsService;
  let paytechService: PaytechService;

  const mockPayment: Partial<Payment> = {
    id: 10,
    bookingId: 42,
    amount: 150000,
    currency: 'XOF',
    customer_phone: '771234567',
    status: PaymentStatus.PROCESSING,
    booking: {
      id: 42,
      car_id: 1,
      customer_name: 'Amadou Diallo',
      customer_email: 'amadou@example.com',
      customer_phone: '771234567',
      start_date: new Date('2026-11-15'),
      end_date: new Date('2026-11-18'),
      total_amount: 150000,
      status: BookingStatus.PENDING,
      created_at: new Date(),
      car: null as any,
    },
  };

  const mockPaymentsRepository = {
    findOne: jest.fn(),
    save: jest.fn((p) => Promise.resolve(p)),
    create: jest.fn((p) => p),
  };

  const mockPaytechService = {
    verifyIpnSignature: jest.fn(),
    initiatePayment: jest.fn(),
  };

  const mockBookingsService = {
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockNotificationsService = {
    sendBookingNotification: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentsRepository,
        },
        { provide: PaytechService, useValue: mockPaytechService },
        { provide: BookingsService, useValue: mockBookingsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paytechService = module.get<PaytechService>(PaytechService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Security: Rejection of invalid IPNs before any modification', () => {
    it('should throw BadRequestException and never modify database if signature is invalid', async () => {
      mockPaytechService.verifyIpnSignature.mockReturnValue(false);

      const invalidPayload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_complete',
        item_price: 150000,
        hmac_compute: 'invalid_hmac',
      };

      await expect(service.handleIpn(invalidPayload)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
      expect(mockBookingsService.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('Consistency checks: ref_command, amount, currency, payment existence', () => {
    beforeEach(() => {
      mockPaytechService.verifyIpnSignature.mockReturnValue(true);
    });

    it('should throw NotFoundException if payment is not found in database', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      const payload = {
        ref_command: 'CMD-999-42-12345',
        type_event: 'sale_complete',
        item_price: 150000,
      };

      await expect(service.handleIpn(payload)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if ref_command is inconsistent with payment', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue({ ...mockPayment });

      const payload = {
        ref_command: 'CMD-999-inconsistent-ref',
        custom_field: JSON.stringify({ payment_id: 10 }),
        type_event: 'sale_complete',
        item_price: 150000,
      };

      await expect(service.handleIpn(payload)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if amount does not match', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue({ ...mockPayment });

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_complete',
        final_item_price: 50000, // Expected: 150000
      };

      await expect(service.handleIpn(payload)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if currency does not match', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue({ ...mockPayment });

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_complete',
        item_price: 150000,
        currency: 'USD', // Expected: XOF
      };

      await expect(service.handleIpn(payload)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Events handling: sale_complete & sale_canceled', () => {
    beforeEach(() => {
      mockPaytechService.verifyIpnSignature.mockReturnValue(true);
    });

    it('should successfully confirm payment and booking on sale_complete event', async () => {
      const paymentInstance = { ...mockPayment };
      mockPaymentsRepository.findOne.mockResolvedValue(paymentInstance);
      mockBookingsService.updateStatus.mockResolvedValue({
        id: 42,
        status: BookingStatus.CONFIRMED,
      });

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_complete',
        item_price: 150000,
        currency: 'XOF',
        transaction_id: 'TX-PAYTECH-7890',
      };

      await service.handleIpn(payload);

      expect(paymentInstance.status).toBe(PaymentStatus.SUCCESS);
      expect(paymentInstance.transaction_id).toBe('TX-PAYTECH-7890');
      expect(mockPaymentsRepository.save).toHaveBeenCalledWith(paymentInstance);
      expect(mockBookingsService.updateStatus).toHaveBeenCalledWith(
        42,
        BookingStatus.CONFIRMED,
      );
      expect(
        mockNotificationsService.sendBookingNotification,
      ).toHaveBeenCalled();
    });

    it('should mark payment as CANCELLED on sale_canceled event without confirming booking', async () => {
      const paymentInstance = { ...mockPayment };
      mockPaymentsRepository.findOne.mockResolvedValue(paymentInstance);

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_canceled',
        item_price: 150000,
        currency: 'XOF',
      };

      await service.handleIpn(payload);

      expect(paymentInstance.status).toBe(PaymentStatus.CANCELLED);
      expect(mockPaymentsRepository.save).toHaveBeenCalledWith(paymentInstance);
      expect(mockBookingsService.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if event is unknown or unsupported', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue({ ...mockPayment });

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'unknown_event_type',
        item_price: 150000,
      };

      await expect(service.handleIpn(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Idempotency: Avoiding multiple processing of the same notification', () => {
    beforeEach(() => {
      mockPaytechService.verifyIpnSignature.mockReturnValue(true);
    });

    it('should ignore duplicate sale_complete IPN if payment is already SUCCESS', async () => {
      const alreadySuccessPayment = {
        ...mockPayment,
        status: PaymentStatus.SUCCESS,
      };
      mockPaymentsRepository.findOne.mockResolvedValue(alreadySuccessPayment);

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_complete',
        item_price: 150000,
        currency: 'XOF',
      };

      await service.handleIpn(payload);

      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
      expect(mockBookingsService.updateStatus).not.toHaveBeenCalled();
      expect(
        mockNotificationsService.sendBookingNotification,
      ).not.toHaveBeenCalled();
    });

    it('should ignore duplicate sale_canceled IPN if payment is already CANCELLED', async () => {
      const alreadyCancelledPayment = {
        ...mockPayment,
        status: PaymentStatus.CANCELLED,
      };
      mockPaymentsRepository.findOne.mockResolvedValue(alreadyCancelledPayment);

      const payload = {
        ref_command: 'CMD-10-42-12345',
        type_event: 'sale_canceled',
        item_price: 150000,
        currency: 'XOF',
      };

      await service.handleIpn(payload);

      expect(mockPaymentsRepository.save).not.toHaveBeenCalled();
    });
  });
});
