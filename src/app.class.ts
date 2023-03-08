import express, { Request, Response } from "express"
// import config from "./config/config";
import mongoSetup from "./config/db/mongo";
import { AttachmentRoutes } from "./routes/AttachmentRoute/AttachmentRoute.route";
import CommonClass from "./utils/classes/CommonClass";
import { restResponseTimeHistogram, startMetricsServer } from "./middlewares/prometheus/prom-metrics";

import responseTime from "response-time";

class App extends CommonClass {

    private app: express.Application;
    private appPort: any;

    constructor() {
        super();
        this.app = express();
        this.configApp();
        this.initRoutes();
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
    }

    private configApp() {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }));
        this.appPort = this.config.default.PORT || 3002
    }

    public startApp() {

        mongoSetup();

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
        })
    }
}

export default App;