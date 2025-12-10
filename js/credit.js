// Fade-animation for cards on scroll
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.credit-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.2 });

    cards.forEach(card => {
        card.style.opacity = "0";
        card.style.transform = "translateY(40px)";
        card.style.transition = "0.8s ease";
        observer.observe(card);
    });
});

// Back navigation
function goBack() {
    document.body.style.opacity = "0.6";
    document.body.style.transition = "0.4s";
    setTimeout(() => {
        window.location.href = "game.html";
    }, 400);
}
