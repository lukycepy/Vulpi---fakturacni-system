import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IcoValidator } from '@vulpi/business-logic';

export interface AresData {
  ico: string;
  dic?: string;
  name: string;
  address: string;
}

@Injectable()
export class AresService {
  constructor(private readonly httpService: HttpService) {}

  async lookup(ico: string): Promise<AresData> {
    // 1. Validate ICO format (using business-logic package)
    if (!IcoValidator.validate(ico)) {
      throw new BadRequestException('Neplatný formát IČO');
    }

    try {
      // 2. Call ARES API
      // Using the new ARES REST API endpoint (ekonomicke-subjekty returns aggregated data from all registers)
      const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`;
      const { data } = await firstValueFrom(this.httpService.get(url));

      // 3. Map response
      if (!data) {
        throw new BadRequestException('Subjekt s tímto IČO nebyl nalezen v ARES');
      }

      // Construct address if textovaAdresa is missing
      let address = data.sidlo?.textovaAdresa;
      if (!address && data.sidlo) {
        const s = data.sidlo;
        const street = s.nazevUlice || s.nazevCastiObce || '';
        const number = [s.cisloDomovni, s.cisloOrientacni].filter(Boolean).join('/');
        const city = s.nazevObce || '';
        const zip = s.psc ? String(s.psc).replace(/\s/g, '') : '';
        
        address = `${street} ${number}, ${zip} ${city}`.trim().replace(/^,/, '').trim();
      }

      return {
        ico: data.ico,
        dic: data.dic,
        name: data.obchodniJmeno,
        address: address || '',
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new BadRequestException('Subjekt s tímto IČO nebyl nalezen v ARES');
      }
      throw new BadRequestException('Chyba při komunikaci s ARES API: ' + (error.message || error));
    }
  }
}
