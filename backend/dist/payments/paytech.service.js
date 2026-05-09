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
var PaytechService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaytechService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let PaytechService = PaytechService_1 = class PaytechService {
    configService;
    httpService;
    logger = new common_1.Logger(PaytechService_1.name);
    apiKey;
    apiSecret;
    isTestMode;
    constructor(configService, httpService) {
        this.configService = configService;
        this.httpService = httpService;
        this.apiKey = this.configService.get('PAYTECH_API_KEY');
        this.apiSecret = this.configService.get('PAYTECH_SECRET_KEY');
        this.isTestMode = this.apiKey === 'test';
    }
    async initiatePayment(payment, booking, successUrl, cancelUrl, ipnUrl) {
        if (this.isTestMode) {
            this.logger.warn('Mode test activé - simulation de redirection PayTech');
            return `http://localhost:5173/payment/success?status=simulated&bookingId=${booking.id}`;
        }
        const refCommand = `CMD-${booking.id}-${Date.now()}`;
        const payload = {
            item_name: `Location ${booking.car.brand} ${booking.car.model}`,
            item_price: payment.amount,
            currency: 'XOF',
            ref_command: refCommand,
            notification_url: ipnUrl,
            success_url: successUrl,
            cancel_url: cancelUrl,
            custom_field: JSON.stringify({
                booking_id: booking.id,
                payment_id: payment.id,
                payment_method: payment.payment_method,
            }),
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://paytech.sn/api/payment/request-payment', payload, {
                headers: {
                    API_KEY: this.apiKey,
                    API_SECRET: this.apiSecret,
                    'Content-Type': 'application/json',
                },
            }));
            const data = response.data;
            if (data.success && data.redirect_url) {
                payment.paytech_token = data.token;
                return data.redirect_url;
            }
            else {
                throw new Error('Réponse PayTech invalide');
            }
        }
        catch (error) {
            this.logger.error('Erreur initiation PayTech', error);
            throw new Error('Échec de la communication avec PayTech');
        }
    }
    verifyIpnSignature(payload, signature) {
        return true;
    }
};
exports.PaytechService = PaytechService;
exports.PaytechService = PaytechService = PaytechService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService])
], PaytechService);
//# sourceMappingURL=paytech.service.js.map