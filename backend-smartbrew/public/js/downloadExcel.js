document.getElementById('downloadExcel').addEventListener('click', async function() {
	var baseURL = window.location.origin;

    console.log('Download Excel button clicked', batchIds, typeof(batchIds));
    try {
        const response = await fetch(`${baseURL}/api/download-excel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batchIds })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'sensor_data.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.error('Failed to download Excel file');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});