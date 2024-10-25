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
	} catch (error) {
		console.error('Error calling FastAPI:', error.message);

		if (error.response) {
			console.error('Error Response Status:', error.response.status);
			console.error('Error Response Headers:', error.response.headers);
			console.error('Error Response Data:', error.response.data);
		} else if (error.request) {
			console.error('Error Request:', error.request);
		} else {
			console.error('General Error:', error.message);
		}
	}
}

module.exports = { analyzeBatch };
