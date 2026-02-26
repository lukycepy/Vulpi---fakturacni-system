"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const prisma_module_1 = require("../database/prisma.module");
const communication_module_1 = require("../communication/communication.module");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./services/auth.service");
const two_factor_service_1 = require("./services/two-factor.service");
const webauthn_service_1 = require("./services/webauthn.service");
const password_service_1 = require("./services/password.service");
const auth_controller_1 = require("./controllers/auth.controller");
const two_factor_controller_1 = require("./controllers/two-factor.controller");
const webauthn_controller_1 = require("./controllers/webauthn.controller");
const password_controller_1 = require("./controllers/password.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const google_strategy_1 = require("./strategies/google.strategy");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            communication_module_1.CommunicationModule,
            config_1.ConfigModule,
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secret',
                signOptions: { expiresIn: '15m' },
            }),
        ],
        controllers: [
            auth_controller_1.AuthController,
            two_factor_controller_1.TwoFactorController,
            webauthn_controller_1.WebAuthnController,
            password_controller_1.PasswordController
        ],
        providers: [
            auth_service_1.AuthService,
            two_factor_service_1.TwoFactorService,
            webauthn_service_1.WebAuthnService,
            password_service_1.PasswordService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            google_strategy_1.GoogleStrategy
        ],
        exports: [auth_service_1.AuthService, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, jwt_1.JwtModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map