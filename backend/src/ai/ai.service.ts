import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your_gemini_api_key' && apiKey !== 'VOTRE_NOUVELLE_CLE_ICI') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Utilisation du modèle 1.5-flash pour plus de rapidité et de précision
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  async chat(message: string): Promise<string> {
    const input = message.toLowerCase();

    // Système de réponses intelligentes pré-configurées pour la démo
    const responses = [
      {
        keys: ['salut', 'bonjour', 'hello', 'hey'],
        reply: "Bonjour ! Je suis Junior, votre concierge DAKAR DRIVE. C'est un plaisir de vous accueillir. Comment puis-je rendre votre séjour à Dakar inoubliable aujourd'hui ?"
      },
      {
        keys: ['tarif', 'prix', 'coût', 'combien', 'cher'],
        reply: "Nos tarifs reflètent l'exclusivité de notre flotte. Par exemple, nos Range Rover débutent à 150 000 FCFA/jour avec chauffeur VIP. Souhaitez-vous un devis pour un modèle précis ?"
      },
      {
        keys: ['mariage', 'cérémonie', 'fête'],
        reply: "Pour votre mariage, nous recommandons notre Range Rover Vogue Autobiography blanche ou notre Mercedes Classe S. Nous proposons un pack prestige avec décoration et chauffeur. C'est le choix favori de nos clients VIP."
      },
      {
        keys: ['aéroport', 'aibd', 'transfert', 'arrivée'],
        reply: "Nous assurons des transferts VIP depuis l'aéroport Blaise Diagne (AIBD). Votre chauffeur vous attendra avec une pancarte personnalisée. Pour un trajet rapide et luxueux, la Porsche Cayenne est idéale."
      },
      {
        keys: ['liste', 'voiture', 'flotte', 'disponible', 'choix'],
        reply: "Notre flotte se compose de véhicules de prestige : Range Rover Vogue, Porsche Cayenne, Mercedes Classe S, et Toyota Land Cruiser V8. Tous nos véhicules sont récents et entretenus."
      },
      {
        keys: ['contact', 'appel', 'téléphone', 'joindre'],
        reply: "Vous pouvez nous joindre directement au +221 77 123 45 67 ou passer nous voir à notre agence sur la Corniche Ouest."
      }
    ];

    // Recherche d'une correspondance
    for (const res of responses) {
      if (res.keys.some(k => input.includes(k))) {
        return res.reply;
      }
    }

    // Si aucune clé ne correspond, on tente l'IA si elle est disponible
    if (this.model) {
      try {
        const systemPrompt = `Tu es Junior, le concierge de prestige pour DAKAR DRIVE... (répond à : ${message})`;
        const result = await this.model.generateContent(systemPrompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        // Fallback en cas d'erreur API
      }
    }

    return "Je comprends parfaitement votre demande. En tant que concierge de prestige, je m'assure que chaque détail soit parfait. Souhaitez-vous que je vous mette en relation avec un de nos conseillers pour finaliser votre expérience de luxe ?";
  }
}