import express, { Request, Response } from "express"
// import config from "./config/config";
import mongoSetup from "./config/db/mongo";
import { AttachmentRoutes } from "./routes/AttachmentRoute/AttachmentRoute.route";
import CommonClass from "./utils/classes/CommonClass";
import { restResponseTimeHistogram, startMetricsServer } from "./middlewares/prometheus/prom-metrics";

import responseTime from "response-time";
import { errorMiddleware } from "./middlewares/error/error.middleware";
import EdgeModel from "./models/MicroserviceArchitectureModels/EdgeModel/EdgeModel.model";
import MLModelInputsConts from "./utils/constants/MLModelInput.constants";
import { log } from "console";

class App extends CommonClass {

    private app: express.Application;
    private appPort: any;

    constructor() {
        super();
        this.app = express();
        this.configApp();
        this.initRoutes();
        this.initMiddlewares();
    }

    private initRoutes() {

        this.app.use(
            responseTime((req: Request, res: Response, time: number) => {
                if (req?.route?.path) {
                    restResponseTimeHistogram.observe(
                        {
                            method: req.method,
                            route: req.route.path,
                            status_code: res.statusCode,
                        },
                        time * 1000
                    );
                }
            })
        );
        this.app.use('/attachment', AttachmentRoutes)
        this.app.get('/', (req: Request, res: Response, next) => {
            res.json({
                message: "Hello World"
            })
        })
        this.app.get('/deneme', async (req: Request, res: Response) => {
            // let test = {
            //     messageRealm: "deneme"
            // }

            // console.log(test);

            // let deneme = new EdgeModel(test)
            // let resp = await deneme.save();

            res.status(200).json(31)
        })
        this.app.get('/stressTest', (req: Request, res: Response) => {

            for (let i = 0; i < 9999999999; i++) {

            }
            res.status(200).json(
                { message: "Stress Test Done." }
            )

        })
    }

    private configApp() {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }));
        this.appPort = this.config.default.PORT || 3002
    }

    private initMiddlewares() {
        this.app.use(errorMiddleware)
    }

    public async startApp() {

        await mongoSetup();

        this.app.listen(this.appPort, () => {
            console.log(`
            ▒█▀▀▀█ ▒█▀▄▀█ ░█▀▀█ ▒█▀▀█ ▀▀█▀▀ ▒█▀▀▄ ▒█▀▀▀ ▒█░░░ ▀▀█▀▀ ░█▀▀█ ░░ ░█▀▀█ ▒█▀▀█ ▀█▀ 
            ░▀▀▀▄▄ ▒█▒█▒█ ▒█▄▄█ ▒█▄▄▀ ░▒█░░ ▒█░▒█ ▒█▀▀▀ ▒█░░░ ░▒█░░ ▒█▄▄█ ▀▀ ▒█▄▄█ ▒█▄▄█ ▒█░ 
            ▒█▄▄▄█ ▒█░░▒█ ▒█░▒█ ▒█░▒█ ░▒█░░ ▒█▄▄▀ ▒█▄▄▄ ▒█▄▄█ ░▒█░░ ▒█░▒█ ░░ ▒█░▒█ ▒█░░░ ▄█▄
            `)
            startMetricsServer();

            if (this.config.NODE_ENV !== "production") {
                this.logger.log("info", `Smart Delta API is ONLINE at PORT : ${this.appPort}`)
            }

            console.log(__dirname)

        })
    }
}

export default App;