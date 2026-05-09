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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
let AiService = class AiService {
    configService;
    genAI;
    model;
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (apiKey && apiKey !== 'your_gemini_api_key') {
            this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        }
    }
    async chat(message) {
        if (!this.model) {
            return "Je suis Baye, votre concierge virtuel. Le service IA est en cours de configuration. N'hésitez pas à appeler le +221 77 123 45 67 pour une assistance immédiate.";
        }
        const prompt = `Tu es Baye, le concierge virtuel de DAKAR DRIVE, une agence de location de voitures de luxe à Dakar. 
    Tu parles un français impeccable et connais parfaitement le Sénégal (trafic Dakar, routes de la Corniche, tarifs essence). 
    Réponds avec courtoisie et élégance. Propose la Range Rover pour les mariages et la Porsche pour l'aéroport.
    
    Question du client : ${message}`;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
        catch (error) {
            console.error('Erreur Gemini:', error);
            return "Désolé, je rencontre quelques difficultés techniques. Veuillez réessayer plus tard ou contacter notre équipe au +221 77 123 45 67.";
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map