const axios = require('axios');

async function analyzeBatch(batchId) {
	try {
		const response = await axios.post(
			'http://localhost:8000/analyze',
			{
				batch_id: batchId,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
		console.log('Analysis Result:', response.data);
	} catch (error) {
		console.error('Error calling FastAPI:', error);
		if (error.response) {
			console.error('Error Response:', error.response.status, error.response.headers, error.response.data);
		}
	}
}

module.exports = { analyzeBatch };
