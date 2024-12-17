import DockerHubService from '../services/DockerHubService';

class DockerHubController {
	public async getLatestTag(username: string, podName: string): Promise<any> {
		const dockerHubService = DockerHubService.getInstance();
		return await dockerHubService.fetchLatestTag(username, podName);
	}
}

export default DockerHubController;
