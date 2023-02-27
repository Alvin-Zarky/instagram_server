"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const dotenv_1 = require("dotenv");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const colors_1 = __importDefault(require("colors"));
const sequelize_1 = __importDefault(require("./config/sequelize"));
const userRoute_1 = __importDefault(require("./router/userRoute"));
const errorMessageMiddleware_1 = __importDefault(require("./middleware/errorMessageMiddleware"));
(0, dotenv_1.config)();
const PORT = process.env.PORT || 8000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use((0, express_1.urlencoded)({ extended: false }));
app.use('/api/instagram/clone/user', userRoute_1.default);
app.use('*', (req, res, next) => {
    res.status(404).send(`Cloud not be found with this url site~ ${req.originalUrl}`);
});
app.use(errorMessageMiddleware_1.default);
sequelize_1.default.sync({ alter: true }).then((url) => {
    console.log(colors_1.default.green.bold.underline.inverse(`Connection Successfully-${url.config.host}-${url.config.database}-${url.config.host}-${url.config.port}`));
}).catch((err) => {
    console.error(colors_1.default.red.underline.bold(`Connection Error: ${err.message}`));
});
const server = app.listen(PORT, () => {
    console.log(colors_1.default.bgCyan.inverse.bold(`Server in ${process.env.NODE_ENV} is running on port ${PORT}`));
});
process.on('unhandledRejection', (err, promise) => {
    server.close(() => process.exit(1));
    console.error(colors_1.default.bgRed.inverse(`Server handler error ${err.message}`));
});
