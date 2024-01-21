import { Request, Response } from 'express';
import CommonClass from '../utils/classes/CommonClass';
import { PythonShell, Options } from 'python-shell';
import BaseError from '../utils/classes/BaseErrorClass';
import fs from 'fs';
import { format } from '@fast-csv/format';
import axios from 'axios';
import FormData from 'form-data';
import AttachmentModel from '../models/MicroserviceArchitectureModels/AttachmentModel/AttachmentModel.model';
import { MLCSVRow } from '../utils/types/MLCSVRow.type';
import MLModelInputsConts from '../utils/constants/MLModelInput.constants';
export default class AnalysisController extends CommonClass {
  constructor() {
    super();
  }
 async writeCsvFile(filePath: string, data: any[]):Promise<void>{
    return new Promise<void>((resolve, reject) => {
        const csvStream = format({ headers: true });
        const writableStream = fs.createWriteStream(filePath);
        csvStream.pipe(writableStream);

        data.forEach((log: any) => {
            csvStream.write(log);
        });

        csvStream.end();

        writableStream.on('finish', () => {
            console.log(`CSV file ${filePath} has been written successfully.`);
            resolve();
        });

        writableStream.on('error', (err) => {
            console.error(`Error writing CSV file ${filePath}:`, err);
            reject(err);
        });
    });
};
 
 
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
  async compareLogFiles(req: Request, res: Response): Promise<any> {
 
    try {
	  const { filePath1, filePath2 } = req.body;
	  const csvStream1 = await this.formatAttachmentToCSV(filePath1);
	  const csvStream2 = await this.formatAttachmentToCSV(filePath2);

	  const formData = new FormData();
			formData.append('file1', csvStream1, 'data1.csv');
			formData.append('file2', csvStream2, 'data2.csv');

	  // Send POST request to the Flask API
	  const apiResponse = await axios.post('http://127.0.0.1:5006/categorical_comparison', formData, {
		headers: formData.getHeaders()
	  });
  
	  // Assuming your Flask API returns some data
	  const responseData = apiResponse.data;
	  
  console.log(responseData);
	  // Handle the response as needed
	  return responseData;
    } catch (err: any) {
      console.error('Error occurred while running the Python script:', err);
      throw new BaseError(
        err.message || 'Error occurred while sendıng csv files to flask:',
        'Node.js flask categorical comparison execution failed',
        500,
        'Compare Log Files ERROR'
      );
    }
  }
  async formatAttachmentToCSV(attachmentName: string): Promise<any> {
	try {
		const CSVRowArray: Array<MLCSVRow> = [];


		const attachment = await AttachmentModel.findOne({ path: attachmentName }).lean();
		if (!attachment) {
			throw new BaseError('Attachment Not Found', 'Not Found', 404, 'Attachment Not Found');
		}
		const directions = attachment!.directions;

		const csvHeaders = ['destination_id', 'edge_id', 'method', 'level','service', 'class', 'Class.keyword'];
		
		Object.values(MLModelInputsConts).forEach((MLCONST) => {
			csvHeaders.push(MLCONST);
		});

		directions.forEach((direction) => {
			direction.edges.forEach((edge) => {
				let CSVRow = <MLCSVRow>{};
				CSVRow.method = edge.method;
				CSVRow.level = edge.level;	
				CSVRow.service = edge.service;
				CSVRow.class = edge.class;
				CSVRow.classKeyword = edge.class;
				console.log('Method:', edge.method);
				console.log('Level:', edge.level);
		
				CSVRow.destination_id = direction._id?.toString();
				CSVRow.edge_id = edge._id?.toString();
				CSVRow.messageRealm = edge.messageRealm;
				CSVRow.serviceAction = edge.serviceAction;
				CSVRow['messageParams.subscriber'] = edge.subscriber;
				CSVRow['messageParams.calledMessageQueue'] = edge.calledMessageQueue;
				CSVRow['messageParams.type'] = edge.type;
				CSVRow['messageParams.messageID'] = edge.messageID;
				CSVRow['messageParams.correlationID'] = edge.correlationID;
				CSVRow['messageParams.transactionID'] = edge.transactionID;
				CSVRow['messageParams.originatingMS'] = edge.originatingMS;
				CSVRow['messageParams.terminatingMS'] = edge.terminatingMS;
				CSVRow['serviceData.httpParams.statusCode'] = edge.statusCode;
				CSVRow.message_id_length = edge.messageIDLen;
				CSVRow.correlation_id_length = edge.correlationID?.length;
				CSVRow.transaction_id_length = edge.transactionID?.length;
				console.log('CSVRow:', CSVRow);
				CSVRowArray.push(CSVRow);
			});
		});

		const csvStream = format({ headers: true });
		// Write the headers to the CSV file
		csvStream.write(csvHeaders);

		// Write the data to the CSV file
		CSVRowArray.forEach((row: any) => {
			csvStream.write(row);
		});

		// End the CSV stream and pipe it to the response
		csvStream.end();

		return csvStream;
	}  catch (error: any) {
		throw new BaseError(
			error.message || 'Error happened while formating attachment to CSV',
			'Model Could Not Be Formatted to CSV',
			500,
			'Training Error'
		);
	}
}

}
