
const URLTOBACKEND = 'http://localhost:3000/';

function downloadReport() {
    axios.get(`${URLTOBACKEND}user/download`, { headers: { "Authorization": token } })
        .then((response) => {
            console.log(response);
            if (response.status === 200) {
                console.log("Download in Progress")
                //the backend is essentially sending a download link
                //  which if we open in browser, the file would download
                var a = document.createElement("a");
                a.href = response.data.fileURL;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message)
            }

        })
        .catch((err) => {
            showError(err)
        });
}
=======
const URLTOBACKEND = 'http://localhost:3000/';

function downloadReport() {
    axios.get(`${URLTOBACKEND}user/download`, { headers: { "Authorization": token } })
        .then((response) => {
            console.log(response);
            if (response.status === 200) {
                console.log("Download in Progress")
                //the backend is essentially sending a download link
                //  which if we open in browser, the file would download
                var a = document.createElement("a");
                a.href = response.data.fileURL;
                a.download = 'myexpense.csv';
                a.click();
            } else {
                throw new Error(response.data.message)
            }

        })
        .catch((err) => {
            showError(err)
        });
}
