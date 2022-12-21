import Popup from '../components/Popup'

const $popups = document.querySelectorAll('.popup')

$popups.forEach(($popup) => {
	new Popup($popup)
})
