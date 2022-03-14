export const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window
    return Boolean(ethereum && ethereum.isMetaMask)
}

export const getHumanErrorMessage = (error) => {
    let errorMessageToShow = error.message

    // Apparently it is still tricky to get a proper revert reason
    // @link https://stackoverflow.com/questions/66878031/how-to-properly-use-revert-reason-in-web3-js-to-show-meaningful-error-message-in
    if (error.code === -32603) {
        const errorMessageInJson = JSON.parse(error.message.slice(58, error.message.length - 2))

        errorMessageToShow =
            errorMessageInJson.data.data[Object.keys(errorMessageInJson.data.data)[0]].reason
    }

    return errorMessageToShow
}
