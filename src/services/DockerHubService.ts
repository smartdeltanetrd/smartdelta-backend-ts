import axios from 'axios';

class DockerHubService {
	private static instance: DockerHubService | null = null;

	private constructor() {}

	public static getInstance(): DockerHubService {
		if (!DockerHubService.instance) {
			DockerHubService.instance = new DockerHubService();
		}
		return DockerHubService.instance;
	}

	public async fetchLatestTag(username: string, podName: string): Promise<any> {
		try {
			const apiUrl = `https://hub.docker.com/v2/repositories/${username}/${podName}/tags/latest`;
			const response = await axios.get(apiUrl);
			return response.data;
		} catch (error) {
			console.error('Error fetching latest tag from Docker Hub:', error);
			throw new Error('Failed to fetch data from Docker Hub.');
		}
	}
}

export default DockerHubService;
