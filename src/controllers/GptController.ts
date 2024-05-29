import { Request, Response } from 'express';
import CommonClass from '../utils/classes/CommonClass';
import { PythonShell, Options } from 'python-shell';
import BaseError from '../utils/classes/BaseErrorClass';
import OpenAI from 'openai';


export default class GptController extends CommonClass {
  constructor() {
    super();
  }

   generatePrompt(errorData:any): string {
	try {
	 console.log(errorData)
    return `I want you to be a aws expert to diagnose and fix an issue.directly return only a JSON structure containing the diagnosis, steps, and additional note.Below ıs just an example of json structure and content.{
		"diagnosis": "Based on the provided stack trace, it appears that the error is related to a PutItem operation on Amazon DynamoDB. The error seems to occur during the deserialization process after receiving a response from the DynamoDB service.",
		"steps": [
		  {
			"stepNumber": 1,
			"description": "Check the AWS SDK version: Ensure that you are using the latest version of the AWS SDK for Node.js to leverage any bug fixes or improvements."
		  },
		  {
			"stepNumber": 2,
			"description": "Investigate the PutItem operation: Review the code that is responsible for executing the PutItem operation in your application. Check if there are any incorrect parameters being passed or if there are any issues with the data being stored."
		  },
		  {
			"stepNumber": 3,
			"description": "Verify IAM permissions: Make sure that the IAM role associated with your Lambda function or application has the necessary permissions to perform the PutItem operation on the DynamoDB table."
		  },
		  {
			"stepNumber": 4,
			"description": "Examine the DynamoDB table: Check the schema of the DynamoDB table to ensure that it aligns with the data being passed in the PutItem operation. Verify that the table has the correct primary key and any required attributes."
		  },
		  {
			"stepNumber": 5,
			"description": "Enable debug logging: You can enable debug logging for the AWS SDK in your application to get more detailed information about the requests and responses being sent to and received from DynamoDB."
		  },
		  {
			"stepNumber": 6,
			"description": "Utilize AWS CloudWatch Logs: Check the CloudWatch Logs for your Lambda function or application to see if there are any additional error messages or information that can help pinpoint the issue."
		  }
		],
		"additionalNote": "By following these steps and investigating the specific context of the PutItem operation in your application, you should be able to diagnose and potentially fix the issue with the error you are experiencing. If you need further assistance, feel free to provide more details or reach out to AWS support for additional help."
	  }
	   . This  is the real issue stack trace of the error ${errorData}`;
	  } catch (err:any) {
		console.error('Error occurred while running gpt chat:', err);
	throw new BaseError(
		err.message || 'Error occurred while GPT CHAT',
		'GPT failed',
		500,
		'GPT failed Error'
	);

	  }
}
 
  async getErrorInsight(prompt:string): Promise<any> {
	try {
	const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY, 
  });
  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-3.5-turbo',
  };

  const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
  
  return chatCompletion.choices[0].message.content;
  
	  } catch (err:any) {
		console.error('Error occurred while running gpt chat:', err);
	throw new BaseError(
		err.message || 'Error occurred while GPT CHAT',
		'GPT failed',
		500,
		'GPT failed Error'
	);

	  }
}

}
