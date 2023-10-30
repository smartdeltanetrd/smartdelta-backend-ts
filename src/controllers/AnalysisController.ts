import { Request, Response } from 'express';
import CommonClass from '../utils/classes/CommonClass';
import { PythonShell, Options } from 'python-shell';
import BaseError from '../utils/classes/BaseErrorClass';

export default class AnalysisController extends CommonClass {
  constructor() {
    super();
  }

  async predictResourceTrends(req: Request, res: Response): Promise<any> {
	const pythonScriptPath = '/trend_prediction.py'; // Adjust the path accordingly
	const options: Options = {
		mode: 'text',
		pythonPath: '/usr/bin/python3', // Update with the correct Python executable path
		scriptPath: 'src/scripts', // Update with the correct script path
	};

	try {
		const results = await PythonShell.run(pythonScriptPath, options);
		console.log('Python script finished:', results);
		return results;
	  } catch (err:any) {
		console.error('Error occurred while running the Python script:', err);
		throw new BaseError(
			err.message || 'Error occurred while running the Python script:',
			'Python script execution failed',
			500,
			' Resource Prediction ERROR'
		);
	  }
	  
  }

}
