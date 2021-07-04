const handleMessage = data => {
    const jsonData = JSON.parse(data)

    // consume json data, send response

    const response = {
        'status': 0,
    }
    const responseSerialized = JSON.stringify(response)
    return responseSerialized
}

module.exports = { handleMessage }