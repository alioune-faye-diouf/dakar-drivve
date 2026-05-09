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
var AdminInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInitService = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
let AdminInitService = AdminInitService_1 = class AdminInitService {
    authService;
    logger = new common_1.Logger(AdminInitService_1.name);
    constructor(authService) {
        this.authService = authService;
    }
    async onModuleInit() {
        const email = 'admin@dakardrive.sn';
        const password = 'admin123';
        try {
            const admin = await this.authService.createAdmin(email, password);
            this.logger.log(`✅ Administrateur par défaut créé : ${admin.email}`);
        }
        catch (error) {
            if (error.message.includes('Duplicate entry')) {
                this.logger.log(`ℹ️ L'administrateur ${email} existe déjà.`);
            }
            else {
                this.logger.error(`❌ Erreur lors de la création de l'admin : ${error.message}`);
            }
        }
    }
};
exports.AdminInitService = AdminInitService;
exports.AdminInitService = AdminInitService = AdminInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AdminInitService);
//# sourceMappingURL=admin-init.service.js.map