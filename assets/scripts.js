// Remplacer le code existant par celui-ci
document.addEventListener("DOMContentLoaded", function() {
  // Différer l'initialisation de la galerie
  setTimeout(function() {
    $('.gallery').mauGallery({
      columns: {
        xs: 1,
        sm: 2,
        md: 3,
        lg: 3,
        xl: 3
      },
      lightBox: true,
      lightboxId: 'myAwesomeLightbox',
      showTags: true,
      tagsPosition: 'top'
    });
  }, 10); // Petit délai pour permettre au reste de la page de se charger
});