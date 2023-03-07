import express, { Request, Response } from "express"
// import config from "./config/config";
import mongoSetup from "./config/db/mongo";
import { AttachmentRoutes } from "./routes/AttachmentRoute/AttachmentRoute.route";
import CommonClass from "./utils/classes/CommonClass";


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
        this.appPort = this.config.default.PORT || 3001
    }

    public startApp() {

        mongoSetup();

        this.app.listen(this.appPort, () => {
            console.log(`
            ▒█▀▀▀█ ▒█▀▄▀█ ░█▀▀█ ▒█▀▀█ ▀▀█▀▀ ▒█▀▀▄ ▒█▀▀▀ ▒█░░░ ▀▀█▀▀ ░█▀▀█ ░░ ░█▀▀█ ▒█▀▀█ ▀█▀ 
            ░▀▀▀▄▄ ▒█▒█▒█ ▒█▄▄█ ▒█▄▄▀ ░▒█░░ ▒█░▒█ ▒█▀▀▀ ▒█░░░ ░▒█░░ ▒█▄▄█ ▀▀ ▒█▄▄█ ▒█▄▄█ ▒█░ 
            ▒█▄▄▄█ ▒█░░▒█ ▒█░▒█ ▒█░▒█ ░▒█░░ ▒█▄▄▀ ▒█▄▄▄ ▒█▄▄█ ░▒█░░ ▒█░▒█ ░░ ▒█░▒█ ▒█░░░ ▄█▄
            `)

            if (this.config.NODE_ENV !== "production") {
                this.logger.log("info", `Smart Delta API is ONLINE at PORT : ${this.appPort}`)
            }
        })
    }
}

export default App;