import { Request, Response, Router } from 'express';
import DockerHubController from '../../controllers/DockerHubController';

class DockerHubRoute {
	private router: Router;
	private dockerHubController: DockerHubController;

	constructor() {
		this.router = Router();
		this.dockerHubController = new DockerHubController();
		this.initRoutes();
	}

	private initRoutes() {
		this.router.get('/latest-tag', async (req: Request, res: Response) => {
			const { username, podName } = req.query;

			if (!username || !podName) {
				return res.status(400).json({
					message: 'Missing required query parameters: username and podName.'
				});
			}

			try {
				const result = await this.dockerHubController.getLatestTag(username as string, podName as string);
				res.status(200).json(result);
			} catch (error) {
				res.status(500).json({ message: 'Failed to fetch data from Docker Hub.', error: error });
			}
		});
	}

	public getRouter(): Router {
		return this.router;
	}
}

export const DockerHubRoutes = new DockerHubRoute().getRouter();
