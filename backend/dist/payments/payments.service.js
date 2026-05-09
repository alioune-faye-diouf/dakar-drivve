"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./payment.entity");
const paytech_service_1 = require("./paytech.service");
const bookings_service_1 = require("../bookings/bookings.service");
const booking_entity_1 = require("../bookings/booking.entity");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    paymentsRepository;
    paytechService;
    bookingsService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(paymentsRepository, paytechService, bookingsService) {
        this.paymentsRepository = paymentsRepository;
        this.paytechService = paytechService;
        this.bookingsService = bookingsService;
    }
    async createPayment(bookingId, paymentMethod, customerPhone) {
        const booking = await this.bookingsService.findOne(bookingId);
        if (!booking)
            throw new Error('Réservation non trouvée');
        const payment = this.paymentsRepository.create({
            bookingId,
            payment_method: paymentMethod,
            amount: booking.total_amount,
            currency: 'XOF',
            customer_phone: customerPhone,
            status: payment_entity_1.PaymentStatus.PENDING,
        });
        return this.paymentsRepository.save(payment);
    }
    async initiatePaymentAndGetRedirectUrl(paymentId, successUrl, cancelUrl, ipnUrl) {
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId },
            relations: ['booking', 'booking.car'],
        });
        if (!payment)
            throw new Error('Paiement non trouvé');
        const redirectUrl = await this.paytechService.initiatePayment(payment, payment.booking, successUrl, cancelUrl, ipnUrl);
        payment.status = payment_entity_1.PaymentStatus.PROCESSING;
        await this.paymentsRepository.save(payment);
        return redirectUrl;
    }
    async handleIpn(payload) {
        this.logger.log('IPN reçue:', payload);
        const { ref_command, payment_status, payment_method, custom_field, transaction_id, } = payload;
        let paymentId;
        try {
            const custom = JSON.parse(custom_field);
            paymentId = custom.payment_id;
        }
        catch {
            this.logger.error('Impossible de parser custom_field');
            return;
        }
        const payment = await this.paymentsRepository.findOne({
            where: { id: paymentId },
            relations: ['booking'],
        });
        if (!payment) {
            this.logger.error(`Paiement ${paymentId} introuvable`);
            return;
        }
        if (payment_status === 'success') {
            payment.status = payment_entity_1.PaymentStatus.SUCCESS;
            payment.transaction_id = transaction_id;
            await this.bookingsService.updateStatus(payment.bookingId, booking_entity_1.BookingStatus.CONFIRMED);
        }
        else {
            payment.status = payment_entity_1.PaymentStatus.FAILED;
        }
        await this.paymentsRepository.save(payment);
        this.logger.log(`Paiement ${paymentId} mis à jour: ${payment.status}`);
    }
    async findAll() {
        return this.paymentsRepository.find({
            relations: ['booking', 'booking.car'],
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        paytech_service_1.PaytechService,
        bookings_service_1.BookingsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map