//Libraries and Packages
import express, { Request, Response } from 'express';
import session  from 'express-session';
import cors from 'cors';
import responseTime from 'response-time';

import mongoSetup from './config/db/mongo';

//Middlewares
import { errorMiddleware } from './middlewares/error/error.middleware';
import { restResponseTimeHistogram, startMetricsServer } from './middlewares/prometheus/prom-metrics';

//Routes
import { AttachmentRoutes } from './routes/AttachmentRoute/AttachmentRoute.route';

//Helpers and Others
import CommonClass from './utils/classes/CommonClass';
import { KubernetesRoutes } from './routes/KubernetesRoute/KubernetesRoute';
import { AnalysisRoutes } from './routes/AnalysisRoute/AnalysisRoute';
import { ElasticApmRoutes } from './routes/ElasticApmRoute/ElasticApmRoute';
import { GptRoutes } from './routes/GptRoute/GptRoute';

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
							status_code: res.statusCode
						},
						time * 1000
					);
				}
			})
		);
		this.app.use('/elastic', ElasticApmRoutes);
		this.app.use('/attachment', AttachmentRoutes);
		this.app.use('/analysis', AnalysisRoutes);
		this.app.use('/k8s', KubernetesRoutes);
		this.app.use('/gpt', GptRoutes);
		this.app.get('/', (req: Request, res: Response) => {
			res.json({
				message: 'Hello World'
			});
		});
		this.app.get('/stressTest', (req: Request, res: Response) => {
			for (let i = 0; i < 9999999999; i++) { }
			res.status(200).json({ message: 'Stress Test Done.' });
		});
	}

	private configApp() {
		this.app.use(express.json({ limit: '20mb' }));
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(session({
			secret: 'my-secret-key',
			resave: false,
			saveUninitialized: false,
			cookie: {
			  maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
			},
		  }));
		this.app.use(cors())
		this.appPort = this.config.default.PORT || 3002;
	}

	private initMiddlewares() {
		const allowedOrigins = ['http://localhost:3001'];

		const options: cors.CorsOptions = {
			origin: allowedOrigins
		};
		this.app.use(errorMiddleware);
		this.app.use(cors(options));
	}

	public async startApp() {
		await mongoSetup();

		this.app.listen(this.appPort, () => {
			console.log(`
            ▒█▀▀▀█ ▒█▀▄▀█ ░█▀▀█ ▒█▀▀█ ▀▀█▀▀ ▒█▀▀▄ ▒█▀▀▀ ▒█░░░ ▀▀█▀▀ ░█▀▀█ ░░ ░█▀▀█ ▒█▀▀█ ▀█▀ 
            ░▀▀▀▄▄ ▒█▒█▒█ ▒█▄▄█ ▒█▄▄▀ ░▒█░░ ▒█░▒█ ▒█▀▀▀ ▒█░░░ ░▒█░░ ▒█▄▄█ ▀▀ ▒█▄▄█ ▒█▄▄█ ▒█░ 
            ▒█▄▄▄█ ▒█░░▒█ ▒█░▒█ ▒█░▒█ ░▒█░░ ▒█▄▄▀ ▒█▄▄▄ ▒█▄▄█ ░▒█░░ ▒█░▒█ ░░ ▒█░▒█ ▒█░░░ ▄█▄
            `);
			startMetricsServer();

			if (this.config.NODE_ENV !== 'production') {
				this.infoLogger(`Smart Delta API is ONLINE at PORT : ${this.appPort}`);
			}
		});
	}
}

export default App;
