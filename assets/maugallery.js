(function ($) {
  $.fn.mauGallery = function (options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function () {
      var gallery = $(this);

      $.fn.mauGallery.methods.preloadGalleryImages(gallery);

      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      $.fn.mauGallery.listeners(options, gallery);

      $(this)
        .children(".gallery-item")
        .each(function (index) {
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      $(this).fadeIn(500);
    });
  };

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
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

  $.fn.mauGallery.methods = {
    preloadGalleryImages(gallery) {
      const imagesToPreload = [];
      gallery.find(".gallery-item").each(function () {
        if ($(this).prop("tagName") === "IMG") {
          imagesToPreload.push($(this).attr("src"));
        }
      });

      if (imagesToPreload.length > 0) {
        if (imagesToPreload[0]) {
          const mainImg = new Image();
          mainImg.importance = "high";
          mainImg.loading = "eager";
          mainImg.src = imagesToPreload[0];
        }

        for (let i = 1; i < imagesToPreload.length; i++) {
          const img = new Image();
          img.loading = i < 4 ? "eager" : "lazy";
          img.src = imagesToPreload[i];
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
      element.appendTo(".gallery-items-row");
    },

    responsiveImageItem(element) {
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

      let activeTag = $(".tags-bar span.active-tag").data("images-toggle") || "all";
      let imagesCollection = [];

      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }

      let currentIndex = 0;
      $(imagesCollection).each(function (i) {
        if ($(element).attr("src") === $(this).attr("src")) {
          currentIndex = i;
        }
      });

      const nextIndex = (currentIndex + 1) % imagesCollection.length;
      const prevIndex = (currentIndex - 1 + imagesCollection.length) % imagesCollection.length;

      if (imagesCollection[nextIndex]) {
        const nextImg = new Image();
        nextImg.src = $(imagesCollection[nextIndex]).attr("src");
      }

      if (imagesCollection[prevIndex]) {
        const prevImg = new Image();
        prevImg.src = $(imagesCollection[prevIndex]).attr("src");
      }

      lightbox.modal("toggle");
    },

    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function () {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function () {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function () {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function (i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });
      next =
        imagesCollection[index - 1] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));

      const nextIndex = (index - 2 + imagesCollection.length) % imagesCollection.length;
      if (imagesCollection[nextIndex]) {
        const nextImg = new Image();
        nextImg.src = $(imagesCollection[nextIndex]).attr("src");
      }
    },

    nextImage() {
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

      const preloadIndex = (nextIndex + 1) % this._cachedImagesCollection.length;
      const preloadImg = new Image();
      preloadImg.src = $(this._cachedImagesCollection[preloadIndex]).attr("src");
    },

    _updateImageCollection() {
      const activeTag = this._lastActiveTag;
      this._cachedImagesCollection = [];

      if (activeTag === "all") {
        $(".item-column").each((i, el) => {
          if ($(el).children("img").length) {
            this._cachedImagesCollection.push($(el).children("img"));
          }
        });
      } else {
        $(".item-column").each((i, el) => {
          if ($(el).children("img").data("gallery-tag") === activeTag) {
            this._cachedImagesCollection.push($(el).children("img"));
          }
        });
      }
    },

    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${lightboxId ? lightboxId : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${navigation ? '<button class="mg-prev" aria-label="Image précédente" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</button>' : '<span style="display:none;" />'}
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${navigation ? '<button class="mg-next" aria-label="Image suivante" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;">></button>' : '<span style="display:none;" />'}
                        </div>
                    </div>
                </div>
            </div>`);
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

      requestAnimationFrame(() => {
        $(".gallery-item").each(function () {
          const column = $(this).parents(".item-column");
          const shouldShow = tag === "all" || $(this).data("gallery-tag") === tag;

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