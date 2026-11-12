import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PaytechService } from './paytech.service';
import * as crypto from 'crypto';

describe('PaytechService - IPN Verification', () => {
  let service: PaytechService;

  const mockApiKey = 'test_api_key_123456';
  const mockApiSecret = 'test_secret_key_abcdef';

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'PAYTECH_API_KEY') return mockApiKey;
      if (key === 'PAYTECH_SECRET_KEY') return mockApiSecret;
      if (key === 'PAYTECH_MODE') return 'live';
      return null;
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaytechService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<PaytechService>(PaytechService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('HMAC-SHA256 signature verification', () => {
    it('should successfully verify a valid HMAC-SHA256 signature with final_item_price', () => {
      const price = 150000;
      const refCommand = 'CMD-1-1-1731412800000';
      const message = `${price}|${refCommand}|${mockApiKey}`;
      const validHmac = crypto
        .createHmac('sha256', mockApiSecret)
        .update(message)
        .digest('hex');

      const payload = {
        final_item_price: price,
        ref_command: refCommand,
        hmac_compute: validHmac,
      };

      const result = service.verifyIpnSignature(payload);
      expect(result).toBe(true);
    });

    it('should successfully verify a valid HMAC-SHA256 signature with item_price fallback', () => {
      const price = 75000;
      const refCommand = 'CMD-2-2-1731412900000';
      const message = `${price}|${refCommand}|${mockApiKey}`;
      const validHmac = crypto
        .createHmac('sha256', mockApiSecret)
        .update(message)
        .digest('hex');

      const payload = {
        item_price: price,
        ref_command: refCommand,
        hmac_compute: validHmac,
      };

      const result = service.verifyIpnSignature(payload);
      expect(result).toBe(true);
    });

    it('should reject when HMAC-SHA256 signature is altered or invalid', () => {
      const payload = {
        final_item_price: 150000,
        ref_command: 'CMD-1-1-1731412800000',
        hmac_compute: 'f4k3_hm4c_s1gn4tur3_d4t4_h3x',
      };

      const result = service.verifyIpnSignature(payload);
      expect(result).toBe(false);
    });

    it('should reject when amount or ref_command is tampered even with a valid length HMAC', () => {
      const price = 150000;
      const refCommand = 'CMD-1-1-1731412800000';
      const message = `${price}|${refCommand}|${mockApiKey}`;
      const validHmac = crypto
        .createHmac('sha256', mockApiSecret)
        .update(message)
        .digest('hex');

      // Hacker changed price to 1000
      const tamperedPayload = {
        final_item_price: 1000,
        ref_command: refCommand,
        hmac_compute: validHmac,
      };

      const result = service.verifyIpnSignature(tamperedPayload);
      expect(result).toBe(false);
    });
  });

  describe('SHA256 of the two keys verification (Alternative method)', () => {
    it('should successfully verify valid api_key_sha256 and api_secret_sha256', () => {
      const apiKeySha256 = crypto
        .createHash('sha256')
        .update(mockApiKey)
        .digest('hex');

      const apiSecretSha256 = crypto
        .createHash('sha256')
        .update(mockApiSecret)
        .digest('hex');

      const payload = {
        ref_command: 'CMD-3-3-1731413000000',
        item_price: 50000,
        api_key_sha256: apiKeySha256,
        api_secret_sha256: apiSecretSha256,
      };

      const result = service.verifyIpnSignature(payload);
      expect(result).toBe(true);
    });

    it('should reject if only api_key_sha256 is correct but api_secret_sha256 is wrong', () => {
      const apiKeySha256 = crypto
        .createHash('sha256')
        .update(mockApiKey)
        .digest('hex');

      const payload = {
        ref_command: 'CMD-3-3-1731413000000',
        item_price: 50000,
        api_key_sha256: apiKeySha256,
        api_secret_sha256: 'wrong_secret_hash',
      };

      const result = service.verifyIpnSignature(payload);
      expect(result).toBe(false);
    });
  });

  describe('Edge cases and security safeguards', () => {
    it('should reject empty, null or undefined payloads', () => {
      expect(service.verifyIpnSignature(null)).toBe(false);
      expect(service.verifyIpnSignature(undefined)).toBe(false);
      expect(service.verifyIpnSignature({})).toBe(false);
    });

    it('should reject when both HMAC and SHA256 signatures are absent', () => {
      const payload = {
        item_price: 150000,
        ref_command: 'CMD-1',
        type_event: 'sale_complete',
      };
      expect(service.verifyIpnSignature(payload)).toBe(false);
    });
  });
});
