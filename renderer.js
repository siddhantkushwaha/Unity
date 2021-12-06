$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})

const exit = () => {

}

const hide = (self, elementToHide) => {
    let prop = elementToHide.style.display
    let addClass = 'bi-eye-slash-fill'
    let removeClass = 'bi-eye-fill'

    if (prop === 'none') {
        prop = 'block'
    } else {
        prop = 'none'
        addClass = 'bi-eye-fill'
        removeClass = 'bi-eye-slash-fill'
    }

    self.classList.add(addClass)
    self.classList.remove(removeClass)
    elementToHide.style.display = prop
}

const joinPeer = (peerName, peerKey) => {

}

const removeDevice = () => {

}

const clearClipboard = () => {
    console.log("Clear the clipboard.")
}

const copyItem = () => {

}

const eraseItem = () => {

}

const broadcastItem = () => {

}