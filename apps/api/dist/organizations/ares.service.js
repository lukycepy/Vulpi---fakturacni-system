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
exports.AresService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const business_logic_1 = require("@vulpi/business-logic");
let AresService = class AresService {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async lookup(ico) {
        if (!business_logic_1.IcoValidator.validate(ico)) {
            throw new common_1.BadRequestException('Neplatný formát IČO');
        }
        try {
            const url = `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`;
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            if (!data) {
                throw new common_1.BadRequestException('Subjekt s tímto IČO nebyl nalezen v ARES');
            }
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
        }
        catch (error) {
            if (error.response?.status === 404) {
                throw new common_1.BadRequestException('Subjekt s tímto IČO nebyl nalezen v ARES');
            }
            throw new common_1.BadRequestException('Chyba při komunikaci s ARES API: ' + (error.message || error));
        }
    }
};
exports.AresService = AresService;
exports.AresService = AresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], AresService);
//# sourceMappingURL=ares.service.js.map