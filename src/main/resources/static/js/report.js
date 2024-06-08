document.addEventListener("DOMContentLoaded", function() {
    console.log("Report page loaded");
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const containers = document.querySelectorAll('.container');
        const header = document.querySelector('.header');
        const isHidden = sidebar.classList.contains('hidden');

        if (isHidden) {
            sidebar.classList.remove('hidden');
            containers.forEach(container => container.classList.remove('collapsed'));
            header.classList.remove('collapsed');
        } else {
            sidebar.classList.add('hidden');
            containers.forEach(container => container.classList.add('collapsed'));
            header.classList.add('collapsed');
        }
    }
    document.querySelector('.menu-button').addEventListener('click', toggleSidebar);
});
