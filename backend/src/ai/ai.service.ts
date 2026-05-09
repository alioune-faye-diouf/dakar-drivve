import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your_gemini_api_key') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async chat(message: string): Promise<string> {
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
    } catch (error) {
      console.error('Erreur Gemini:', error);
      return "Désolé, je rencontre quelques difficultés techniques. Veuillez réessayer plus tard ou contacter notre équipe au +221 77 123 45 67.";
    }
  }
}