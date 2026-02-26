"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Vulpi API')
        .setDescription('Fakturační systém Vulpi - Public API')
        .setVersion('1.0')
        .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'x-api-key')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
//# sourceMappingURL=main.js.map