// Variables du DOM
const $qs = document.querySelector.bind(document);

const loader = $qs(".loader"),
  loaderTxt = $qs(".loader__txt"),
  buttonNewNote = $qs(".header__button"),
  buttonNewNotePlus = $qs(".button__plus"),
  newNotePannel = $qs(".newNote"),
  buttonSubmit = $qs(".form__confirmer");
let noteTitre = $qs(".form__titre"),
  section = $qs(".section");
const txtNote = $qs(".note__texte"),
  descriptionNote = $qs(".form__description"),
  // Variables pour supprimer toutes les notes d'un coup
  trashButton = $qs(".header__trash"),
  buttonRemoveAll = $qs(".buttonRemoveAll"),
  confirmRemoveAll = $qs(".confirmRemoveAll"),
  buttonConfirmRemoveAll = $qs(".buttonConfirm"),
  buttonCancelRemoveAll = $qs(".buttonAnnuler"),
  overlay = $qs(".overlay"),
  // Boutons pour changer les propriétés du texte
  buttonBold = $qs(".buttonBold"),
  buttonBreakLine = $qs(".buttonBreakLine"),
  buttonUnderline = $qs(".buttonUnderline"),
  buttonList = $qs(".buttonList");

// Autres variables
let arrayNote = [],
  indexNotes = 0,
  notes /*Variable qui sert au moment de supprimer les notes*/,
  storageArray =
    []; /*Array pour stocker le localStorage dedans et remettre les post-it*/

// Pour les couleurs de fond des post-it
const arrayColors = ["lime", "#FF96FE", "#FFA240", "#7afcff", "yellow"];
function backgroundColorNote() {
  return arrayColors[Math.floor(Math.random() * arrayColors.length)];
}

class Note {
  constructor(title, description, index, color) {
    this.title = title;
    this.description = description;
    this.index = index;
    this.color = color;
  }
}

// Car on s'en sert dans l'edit et on a besoin qu'il soit vide
sessionStorage.clear();

// FONCTIONS
// Test pour savoir si le localStorage fonctionne sur le navigateur de l'utilisateur
function isLocalStorageSupported(globalObject, storageType) {
  try {
    const storage = globalObject[storageType];
    storage.setItem("test", "test");
    storage.removeItem("test");
    return true;
  } catch (err) {
    return false;
  }
}
isLocalStorageSupported(window, "localStorage");
if (!isLocalStorageSupported) {
  alert("Erreur avec le LocalStorage, tu ne peux pas utiliser cette page Web");
}

function afficherNotes(anArray) {
  const noteTxt = anArray.map(
    (element) =>
      `
				<div class="section__note" style="background-color: ${element.color}">
					<div class="note__header"  id="${element.index}">
						<button aria-label="Editer la note" class="note__edit" id="${element.title}"></button>
						<h1 class="note__titre">${element.title}</h1>
						<button aria-label="Supprimer la note" class="note__remove" id="${element.title}"></button>
					</div>
					<div class="note__description">${element.description}</div>
				</div>
			`
  );
  const contenuNote = noteTxt.join("");
  txtNote.innerHTML = contenuNote;
  section.appendChild(txtNote);
}

function supprimerNote(anArray) {
  notes = document.querySelectorAll(".note__remove");
  notes.forEach((el) =>
    el.addEventListener("click", () => {
      let indexDuParent = el.parentNode.id;
      let nomDeLaNote = el.id;
      anArray.splice(indexDuParent, 1);
      localStorage.removeItem(nomDeLaNote);
      indexNotes = 0;
      for (let i of anArray) {
        i.index = indexNotes;
        indexNotes++;
      }

      afficherNotes(anArray);
      supprimerNote(anArray);
      editNote();
    })
  );
}

// Pour éditer une note
function editNote() {
  const notesEdite = document.querySelectorAll(".note__edit");
  let isEditing = false;

  notesEdite.forEach((el) =>
    el.addEventListener("click", () => {
      newNotePannel.classList.remove("active");
      buttonNewNotePlus.classList.remove("moins");
      buttonNewNotePlus.classList.add("button__plus--rotation");

      const editHeader = el.parentNode;

      /* Variables qui servent pour qu'on clique pas sur une note 
		qui ne se fait pas modifier pendant qu'une se fait modifier*/
      const h1InHeader = editHeader.childNodes[3];
      const inputInH1 = h1InHeader.childNodes[0];

      const titreNote = editHeader.childNodes[3];

      // Variables pour cibler la description de la note
      const fullNote = editHeader.parentNode;
      const editDescription = fullNote.childNodes[3];

      if (isEditing === false) {
        isEditing = true;

        /* Partie pour enregistrer la valeur de la note et la supprimer du localStorage uniquement
							quand on reclique sur EDIT */
        if (arrayNote.length !== 0) {
          arrayNote.map((el) => {
            if (el.title == titreNote.innerHTML) {
              sessionStorage.setItem(el.title, titreNote.innerHTML);
            }
          });
        }

        titreNote.innerHTML = `<input type="text" value="${titreNote.innerHTML}" class="note__editTitle" />`;
        editDescription.innerHTML = `<div class="note__editButtons">
														<input aria-label="Mot en gras" type="button" class="buttons--props buttonEditBold" />
														<input aria-label="Mot souligné" type="button" class="buttons--props buttonEditUnderline" />
														<input aria-label="Retour à la ligne" type="button" class="buttons--props buttonEditBreakLine" />
														<input aria-label="Faire une liste" type="button" class="buttons--props buttonEditList" />
													 </div>
													 <textarea class="note__editDescription" placeholder="Description...">${editDescription.innerHTML}</textarea>
													`;

        // Bloc de code pour si le titre modifié est vide --> On peut pas continuer
        const wrongTitleEdit = document.querySelector(".note__editTitle");
        wrongTitleEdit.addEventListener("input", () => {
          if (titreNote.childNodes[0].value == "") {
            wrongTitleEdit.placeholder = "Titre";
            wrongTitleEdit.style.border = "3px dashed red";
            el.disabled = true;
          }
          for (let i = 0; i < titreNote.childNodes[0].value.length; i++) {
            if (titreNote.childNodes[0].value[i] == " ") {
              wrongTitleEdit.style.border = "3px dashed red";
              el.disabled = true;
            } else {
              wrongTitleEdit.style.border = "none";
              el.disabled = false;
            }
          }
        });

        // Partie pour les boutons qui modifient le texte, comme BOLD ou UNDERLINE
        const buttonEditBold = document.querySelector(".buttonEditBold");
        const buttonEditBreakLine = document.querySelector(
          ".buttonEditBreakLine"
        );
        const buttonEditUnderline = document.querySelector(
          ".buttonEditUnderline"
        );
        const buttonEditList = document.querySelector(".buttonEditList");
        const textDescriptionEdit = document.querySelector(
          ".note__editDescription"
        );

        const noteDescription = document.querySelectorAll(".note__description");
        noteDescription.forEach((e) => {
          if (
            e.parentNode.childNodes[1].childNodes[3].childNodes[0].value !==
            undefined
          ) {
            e.style.flexDirection = "column";
          }
        });

        buttonEditBold.addEventListener("click", () => {
          textDescriptionEdit.value = `${textDescriptionEdit.value}<b></b> `;
          textDescriptionEdit.focus();
        });
        buttonEditBreakLine.addEventListener("click", () => {
          textDescriptionEdit.value = `${textDescriptionEdit.value}<br> `;
          textDescriptionEdit.focus();
        });
        buttonEditUnderline.addEventListener("click", () => {
          textDescriptionEdit.value = `${textDescriptionEdit.value}<u></u> `;
          textDescriptionEdit.focus();
        });
        buttonEditList.addEventListener("click", () => {
          textDescriptionEdit.value = `${textDescriptionEdit.value}<li></li> `;
          textDescriptionEdit.focus();
        });
      } else if (inputInH1.classList.contains("note__editTitle")) {
        // Fonction pour vérifier que le titre de la note existe pas déjà
        function checkTitleEdit() {
          for (let i = 0; i < localStorage.length; i++) {
            if (
              titreNote.childNodes[0].value == localStorage.key(i) &&
              titreNote.childNodes[0].value !== sessionStorage.key(0)
            ) {
              return false;
            }
          }
        }

        if (checkTitleEdit() === false) {
          alert("Ce titre existe déjà");
        } else {
          // Partie pour supprimer l'ancienne note dans le localStorage
          const noteInSessionStorage = sessionStorage.key(0);
          localStorage.removeItem(noteInSessionStorage);
          sessionStorage.clear();

          const inputTitreEditing = document.querySelector(".note__editTitle");
          const inputDescriptionEditing = document.querySelector(
            ".note__editDescription"
          );

          const noteDescription =
            document.querySelectorAll(".note__description");
          noteDescription.forEach((e) => {
            e.style.flexDirection = "row";
          });

          isEditing = false;

          titreNote.innerHTML = `${inputTitreEditing.value}`;
          editDescription.innerHTML = `${inputDescriptionEditing.value}`;

          arrayNote[editHeader.id].title = titreNote.innerHTML;
          arrayNote[editHeader.id].description = editDescription.innerHTML;

          localStorage.setItem(titreNote.innerHTML, editDescription.innerHTML);
        }
      } else {
        console.log("Erreur dans l'editing");
      }
    })
  );
}

function titleRequiredRemove() {
  noteTitre.classList.remove("titleRequired");
}

// Pour aller chercher tout ce qu'il y a dans le localStorage
if (localStorage.length !== 0) {
  for (let x = 0; x < localStorage.length; x++) {
    const keyStorage = localStorage.key(x);
    const storageNote = localStorage.getItem(keyStorage);

    let newNote = new Note(
      keyStorage,
      storageNote,
      indexNotes,
      backgroundColorNote()
    );
    indexNotes++;
    storageArray.push(newNote);
    afficherNotes(storageArray);

    editNote();

    supprimerNote(arrayNote);

    arrayNote.push(newNote);
  }
}

// Quand on clique sur le bouton ça ouvre le panneau de nouvelle note
function togglePannelNewNote(button) {
  newNotePannel.classList.toggle("active");

  button.classList.toggle("moins");

  if (button.classList.contains("button__plus--rotation")) {
    button.classList.remove("button__plus--rotation");
  } else {
    button.classList.add("button__plus--rotation");
  }
}

// Evénements
// Animation du loader qui part
window.addEventListener("load", () => {
  function loaderVanish() {
    loader.classList.add("loaderEnd");
    loaderTxt.classList.add("loaderTxtEnd");
    $qs("body").style.overflowY = "visible";
  }
  setTimeout(loaderVanish, 300);
});

// Ouverture du panneau pour créer une nouvelle note
buttonNewNote.addEventListener("click", () => {
  togglePannelNewNote(buttonNewNotePlus);
});

// Création d'une nouvelle note
buttonSubmit.addEventListener("click", (e) => {
  e.preventDefault();

  // Boucle pour vérifier que le titre n'existe pas déjà
  function checkTitleCreation() {
    for (let i = 0; i < arrayNote.length; i++) {
      if (noteTitre.value == arrayNote[i].title) {
        return false;
      }
    }
  }

  if (noteTitre.value !== "") {
    if (checkTitleCreation() === false) {
      alert("Ce titre existe déjà");
    } else {
      let newNote = new Note(
        noteTitre.value,
        descriptionNote.value,
        indexNotes,
        backgroundColorNote()
      );
      indexNotes++;
      arrayNote.push(newNote);

      localStorage.setItem(newNote.title, newNote.description);

      afficherNotes(arrayNote);

      noteTitre.value = "";
      descriptionNote.value = "";
      newNotePannel.classList.toggle("active");
      buttonNewNotePlus.classList.toggle("moins");

      // Pour éditer une note
      editNote();
      // POUR SUPPRIMER UN ELEMENT
      supprimerNote(arrayNote);

      buttonNewNotePlus.classList.add("button__plus--rotation");
    }
  } else {
    noteTitre.classList.toggle("titleRequired");
    setTimeout(titleRequiredRemove, 400);
  }
});

// Modifier les propriétés du texte de la description de la note
buttonBold.addEventListener("click", (bouton) => {
  descriptionNote.value = `${descriptionNote.value}<b> </b> `;
  descriptionNote.focus();
});
buttonUnderline.addEventListener("click", (bouton) => {
  descriptionNote.value = `${descriptionNote.value}<u> </u> `;
  descriptionNote.focus();
});
buttonBreakLine.addEventListener("click", (bouton) => {
  descriptionNote.value = `${descriptionNote.value}<br> `;
  descriptionNote.focus();
});
buttonList.addEventListener("click", (bouton) => {
  descriptionNote.value = `${descriptionNote.value}<li> </li> `;
  descriptionNote.focus();
});

// Supprimer toutes les notes en cliquant sur la poubelle
trashButton.addEventListener("click", () => {
  if (arrayNote.length === 0 && storageArray.length === 0) {
    console.log("Aucune note à supprimer");
  } else {
    confirmRemoveAll.classList.toggle("confirmRemoveAll--active");
    overlay.classList.toggle("overlay--active");
  }
});
buttonCancelRemoveAll.addEventListener("click", () => {
  confirmRemoveAll.classList.toggle("confirmRemoveAll--active");
  overlay.classList.toggle("overlay--active");
});
buttonConfirmRemoveAll.addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  arrayNote.length = 0;
  storageArray.length = 0;
  afficherNotes(arrayNote);
  confirmRemoveAll.classList.toggle("confirmRemoveAll--active");
  overlay.classList.toggle("overlay--active");
  trashButton.style.zIndex = "1";
});

// Animation au scroll du bouton 'Nouvelle note'
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    buttonNewNote.classList.add("header__button--scroll");
  } else {
    buttonNewNote.classList.remove("header__button--scroll");
  }
});

// Test pour savoir combien d'espace est utilisé sur le localStorage
let _lsTotal = 0,
  _xLen,
  _x;
for (_x in localStorage) {
  if (!localStorage.hasOwnProperty(_x)) {
    continue;
  }
  _xLen = (localStorage[_x].length + _x.length) * 2;
  _lsTotal += _xLen;
  console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB");
}
console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
