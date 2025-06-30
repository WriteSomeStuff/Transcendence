const modal = document.getElementById("modal") as HTMLDialogElement;
const openModal = document.getElementById("open-modal") as HTMLButtonElement;

openModal.addEventListener('click', () => {
	modal.showModal();
});