(function ($) {
  // Définition du mauGallery comme méthode jQuery
  $.fn.mauGallery = function (options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    // Initialisation d'un tableau vide pour stocker les tags (catégories)
    var tagsCollection = [];
     // Pour chaque élément DOM auquel le plugin est appliqué
    return this.each(function () {
      var gallery = $(this);
 // Différer le préchargement après le rendu initial
 setTimeout(() => {
  $.fn.mauGallery.methods.preloadGalleryImages(gallery);
}, 100); 

      $.fn.mauGallery.methods.createRowWrapper($(this));
          // Si l'option lightBox est activée dans les paramètres
      if (options.lightBox) {
          // Création de la lightbox avec navigation (ou non)
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          // option de navigation (flèches, etc.)
          options.navigation 
        );
      }
// Attache les écouteurs d'événements nécessaires à la galerie
      $.fn.mauGallery.listeners(options, gallery);
// Parcourt chaque élément enfant avec la classe .gallery-item dans la galerie
      $(this)
        .children(".gallery-item")
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
           // Déplace l'élément dans le conteneur (row wrapper) approprié
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Enveloppe l'élément dans une colonne Bootstrap selon le nombre de colonnes défini
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
           // Récupère le tag (catégorie) associé à l'élément
          var theTag = $(this).data("gallery-tag");
          // Si les tags doivent être affichés, que le tag existe, et qu’il n’a pas encore été ajouté
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

// Après avoir collecté tous les tags uniques, s'ils doivent être affichés
      if (options.showTags) {
         // Affiche les tags (filtres) au bon endroit avec la liste de tags collectés
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };
// Nombre de colonnes pour afficher les éléments dans la galerie
  $.fn.mauGallery.defaults = {
    columns: 3,
    // Active ou désactive l'affichage en lightbox (agrandissement des images)
    lightBox: true,
    // ID personnalisé pour la lightbox (si nécessaire)
    lightboxId: null,
    showTags: true,
    // Position des tags dans la galerie ("top" ou "bottom")
    tagsPosition: "bottom", 
     // Active ou non les flèches de navigation dans la lightbox
    navigation: true
  };
  $.fn.mauGallery.listeners = function (options, gallery) {
    gallery.find(".gallery-item").on("click", function () {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    gallery.on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    gallery.on("click", ".mg-prev", () =>
      $.fn.mauGallery.methods.prevImage(options.lightboxId)
    );
    gallery.on("click", ".mg-next", () =>
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    );
  };
//On crée un objet methods qui va contenir les différentes fonctions (méthodes)
  $.fn.mauGallery.methods = {
    // fonction nommée preloadGalleryImages qui prend un paramètre gallery 
    preloadGalleryImages(gallery) {
      const imagesToPreload = [];
      gallery.find(".gallery-item").each(function () {
        if ($(this).prop("tagName") === "IMG") {
          imagesToPreload.push($(this).attr("src"));
        }
      });
    
      if (imagesToPreload.length > 0) {
        // Charger immédiatement uniquement les images visibles dans la fenêtre
        const loadVisibleImages = () => {
          const viewportHeight = window.innerHeight;
          gallery.find(".gallery-item").each(function() {
            if ($(this).prop("tagName") === "IMG") {
              const rect = this.getBoundingClientRect();
              // Si l'image est visible ou proche de la zone visible
              if (rect.top < viewportHeight + 300) {
                const img = new Image();
                img.src = $(this).attr("src");
                img.loading = "eager";
              } else {
                $(this).attr("loading", "lazy");
              }
            }
          });
        };
        
        loadVisibleImages();
        
        // Précharger les autres images après un délai
        if (imagesToPreload.length > 3) {
          setTimeout(() => {
            for (let i = 3; i < imagesToPreload.length; i++) {
              const img = new Image();
              img.loading = "lazy";
              img.src = imagesToPreload[i];
            }
          }, 1000);
        }
      }
    },
    
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    moveItemInRowWrapper(element) {

  // Déplace l'élément spécifié dans un conteneur avec la classe CSS .gallery-items-row
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
       // Vérifie si l'élément est une balise <img>
      if (element.prop("tagName") === "IMG") {
        
        element.addClass("img-fluid");

        if (!element.attr("width") || !element.attr("height")) {
          if (element[0].complete && element[0].naturalWidth > 0) {
            const ratio = element[0].naturalHeight / element[0].naturalWidth;
            element.css("aspect-ratio", `${element[0].naturalWidth} / ${element[0].naturalHeight}`);
            if (!element.attr("width")) element.attr("width", element[0].naturalWidth);
            if (!element.attr("height")) element.attr("height", element[0].naturalHeight);
          } else {
            element.css("aspect-ratio", "4/3");
            element.on("load", function () {
              const ratio = this.naturalHeight / this.naturalWidth;
              $(this).css("aspect-ratio", `${this.naturalWidth} / ${this.naturalHeight}`);
              if (!$(this).attr("width")) $(this).attr("width", this.naturalWidth);
              if (!$(this).attr("height")) $(this).attr("height", this.naturalHeight);
            });
          }
        }

        if (!element.attr("loading")) {
          const isImportant = element.closest(".item-column").index() < 3;
          element.attr("loading", isImportant ? "eager" : "lazy");
          if (isImportant) {
            element.attr("fetchpriority", "high");
          }
        }
      }
    },

    openLightBox(element, lightboxId) {
      const lightbox = $(`#${lightboxId}`);
      if (lightbox.length === 0) {
        console.error(`Lightbox avec l'id ${lightboxId} non trouvée`);
        return;
      }
    
      lightbox.find(".lightboxImage").attr("src", element.attr("src"));
    
      // Mettre en cache la collection d'images pour éviter de la recréer à chaque fois
      if (!this._cachedImagesCollection) {
        this._updateImageCollection();
      }
    
      let currentIndex = 0;
      for (let i = 0; i < this._cachedImagesCollection.length; i++) {
        if ($(element).attr("src") === $(this._cachedImagesCollection[i]).attr("src")) {
          currentIndex = i;
          break;
        }
      }
    
      // Précharger uniquement l'image suivante, pas la précédente
      const nextIndex = (currentIndex + 1) % this._cachedImagesCollection.length;
      
      // Utiliser requestIdleCallback si disponible, sinon setTimeout
      if (window.requestIdleCallback) {
        requestIdleCallback(() => {
          const nextImg = new Image();
          nextImg.src = $(this._cachedImagesCollection[nextIndex]).attr("src");
        });
      } else {
        setTimeout(() => {
          const nextImg = new Image();
          nextImg.src = $(this._cachedImagesCollection[nextIndex]).attr("src");
        }, 200);
      }
    
      lightbox.modal("toggle");
    },
    
    prevImage() {
      // Utiliser la collection mise en cache si disponible
      if (!this._cachedImagesCollection) {
        this._updateImageCollection();
      }
      
      const activeImageSrc = $(".lightboxImage").attr("src");
      let index = 0;
      
      for (let i = 0; i < this._cachedImagesCollection.length; i++) {
        if ($(this._cachedImagesCollection[i]).attr("src") === activeImageSrc) {
          index = i;
          break;
        }
      }
      
      const prevIndex = (index - 1 + this._cachedImagesCollection.length) % this._cachedImagesCollection.length;
      const prev = this._cachedImagesCollection[prevIndex];
      
      $(".lightboxImage").attr("src", $(prev).attr("src"));
      
      // Précharger l'image précédente uniquement si nécessaire
      if (window.requestIdleCallback) {
        requestIdleCallback(() => {
          const nextPrevIndex = (prevIndex - 1 + this._cachedImagesCollection.length) % this._cachedImagesCollection.length;
          const nextImg = new Image();
          nextImg.src = $(this._cachedImagesCollection[nextPrevIndex]).attr("src");
        });
      }
    },

    nextImage() {
  // Vérifier si la collection d'images est mise en cache et à jour
  if (!this._cachedImagesCollection || this._lastActiveTag !== $(".tags-bar span.active-tag").data("images-toggle")) {
    this._lastActiveTag = $(".tags-bar span.active-tag").data("images-toggle");
    this._updateImageCollection();
  }

  const activeImageSrc = $(".lightboxImage").attr("src");
  let index = 0;

  for (let i = 0; i < this._cachedImagesCollection.length; i++) {
    if ($(this._cachedImagesCollection[i]).attr("src") === activeImageSrc) {
      index = i;
      break;
    }
  }

  const nextIndex = (index + 1) % this._cachedImagesCollection.length;
  const next = this._cachedImagesCollection[nextIndex];

  $(".lightboxImage").attr("src", $(next).attr("src"));

  // Précharger l'image suivante uniquement si nécessaire et de manière asynchrone
  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      const preloadIndex = (nextIndex + 1) % this._cachedImagesCollection.length;
      const preloadImg = new Image();
      preloadImg.src = $(this._cachedImagesCollection[preloadIndex]).attr("src");
    });
  }
},
_updateImageCollection() {
  const activeTag = $(".tags-bar span.active-tag").data("images-toggle");
  this._lastActiveTag = activeTag;
  this._cachedImagesCollection = [];

  // Utiliser une seule sélection DOM et la stocker
  const itemColumns = $(".item-column");
  
  if (activeTag === "all") {
    itemColumns.each((i, el) => {
      const img = $(el).children("img");
      if (img.length) {
        this._cachedImagesCollection.push(img[0]);
      }
    });
  } else {
    itemColumns.each((i, el) => {
      const img = $(el).children("img");
      if (img.length && img.data("gallery-tag") === activeTag) {
        this._cachedImagesCollection.push(img[0]);
      }
    });
  }
},
createLightBox(gallery, lightboxId, navigation) {
  // Vérifier si la lightbox existe déjà
  if ($(`#${lightboxId ? lightboxId : "galleryLightbox"}`).length === 0) {
    // Créer la lightbox uniquement si elle n'existe pas
    const lightboxHTML = `<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-body">
            ${navigation ? '<button class="mg-prev" aria-label="Image précédente" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</button>' : '<span style="display:none;" />'}
            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
            ${navigation ? '<button class="mg-next" aria-label="Image suivante" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></button>' : '<span style="display:none;" />'}
          </div>
        </div>
      </div>
    </div>`;
    
    // Ajouter la lightbox au document de manière différée
    setTimeout(() => {
      gallery.append(lightboxHTML);
    }, 0);
  }
},

    showItemTags(gallery, position, tags) {
      var tagItems = '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';
      $.each(tags, function (index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link" data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Position de tags inconnue: ${position}`);
      }
    },

    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
    
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active active-tag");
    
      var tag = $(this).data("images-toggle");
      
      // Mettre à jour la collection d'images pour les fonctions de navigation
      $.fn.mauGallery.methods._lastActiveTag = tag;
      $.fn.mauGallery.methods._cachedImagesCollection = null;
    
      // Utiliser requestAnimationFrame pour optimiser les animations
      requestAnimationFrame(() => {
        // Stocker les éléments DOM pour éviter les requêtes répétées
        const columns = $(".item-column");
        
        columns.each(function() {
          const column = $(this);
          const galleryItem = column.find(".gallery-item");
          const shouldShow = tag === "all" || galleryItem.data("gallery-tag") === tag;
    
          if (shouldShow) {
            column.fadeIn(300);
          } else {
            column.fadeOut(300);
          }
        });
      });
    }
    
  };
}) (jQuery);