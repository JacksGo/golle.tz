document.getElementById('back-button').addEventListener('click', (e) => {
    if (!window.navigation) return;

    const previousPage = navigation?.activation?.from?.url;
    if (!previousPage) return;

    const previousPath = new URL(previousPage).pathname;

    if (previousPath === '/') {
        e.preventDefault();
        history.go(-1);
    } else {
        return true;
    }
});