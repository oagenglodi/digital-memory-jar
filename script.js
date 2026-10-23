const addMemoryBtn = document.getElementById("addMemoryBtn");
const openLetterBtn = document.getElementById("openLetterBtn");

const memoryModal = document.getElementById("memoryModal");
const viewModal = document.getElementById("viewModal");

const closeModal = document.getElementById("closeModal");
const closeViewModal = document.getElementById("closeViewModal");

const memoryForm = document.getElementById("memoryForm");

const memoryTitle = document.getElementById("memoryTitle");
const memoryText = document.getElementById("memoryText");
const memoryMedia = document.getElementById("memoryMedia");

const memoryGrid = document.getElementById("memoryGrid");
const memoryInsideJar = document.getElementById("memoryInsideJar");

const memoryCount = document.getElementById("memoryCount");

const emptyState = document.getElementById("emptyState");

const viewMemory = document.getElementById("viewMemory");

const toast = document.getElementById("toast");

const clearAllBtn = document.getElementById("clearAllBtn");

const letterDate = document.getElementById("letterDate");


/* --------------------------------------------------
   MEMORY STORAGE
-------------------------------------------------- */

let memories = JSON.parse(
    localStorage.getItem("memoryJar")
) || [];


/* --------------------------------------------------
   DATE
-------------------------------------------------- */

letterDate.textContent =
    new Date().toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );


/* --------------------------------------------------
   OPEN MODAL
-------------------------------------------------- */

function openAddMemory() {

    memoryModal.classList.add("active");

    memoryTitle.focus();
}

addMemoryBtn.addEventListener(
    "click",
    openAddMemory
);

openLetterBtn.addEventListener(
    "click",
    openAddMemory
);


/* --------------------------------------------------
   CLOSE MODALS
-------------------------------------------------- */

closeModal.addEventListener(
    "click",
    () => {
        memoryModal.classList.remove("active");
    }
);

closeViewModal.addEventListener(
    "click",
    () => {
        viewModal.classList.remove("active");
    }
);


/* Click outside modal */

memoryModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === memoryModal
        ) {
            memoryModal.classList.remove("active");
        }

    }
);


viewModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === viewModal
        ) {
            viewModal.classList.remove("active");
        }

    }
);


/* --------------------------------------------------
   ADD MEMORY
-------------------------------------------------- */

memoryForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const title =
            memoryTitle.value.trim();

        const text =
            memoryText.value.trim();

        const file =
            memoryMedia.files[0];


        if (!title || !text) {
            return;
        }


        let mediaData = null;

        let mediaType = null;


        /*
         Convert uploaded image/video
         into a data URL.

         This means the memory can
         remain stored in the browser.
        */

        if (file) {

            mediaData =
                await fileToDataURL(file);

            mediaType =
                file.type.startsWith("video")
                    ? "video"
                    : "image";
        }


        const memory = {

            id: Date.now(),

            title,

            text,

            mediaData,

            mediaType,

            date:
                new Date().toLocaleDateString(
                    undefined,
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                )
        };


        memories.unshift(memory);


        saveMemories();

        renderMemories();


        memoryModal.classList.remove(
            "active"
        );


        memoryForm.reset();


        showToast(
            "Memory added to your jar! 🫙"
        );


        animateMemoryIntoJar();

    }
);


/* --------------------------------------------------
   FILE TO DATA URL
-------------------------------------------------- */

function fileToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();

            reader.onload =
                () => resolve(
                    reader.result
                );

            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );
}


/* --------------------------------------------------
   SAVE MEMORIES
-------------------------------------------------- */

function saveMemories() {

    localStorage.setItem(
        "memoryJar",
        JSON.stringify(memories)
    );

}


/* --------------------------------------------------
   RENDER EVERYTHING
-------------------------------------------------- */

function renderMemories() {

    memoryCount.textContent =
        memories.length;


    renderJar();


    renderGallery();

}


/* --------------------------------------------------
   RENDER JAR
-------------------------------------------------- */

function renderJar() {

    memoryInsideJar.innerHTML = "";


    /*
       Only display a reasonable number
       of notes inside the physical jar.
    */

    const jarMemories =
        memories.slice(0, 18);


    jarMemories.forEach(
        (memory, index) => {

            const note =
                document.createElement("div");


            note.className =
                "jar-memory";


            note.style.setProperty(
                "--rotation",
                `${randomNumber(-12, 12)}deg`
            );


            if (memory.mediaData) {

                if (
                    memory.mediaType ===
                    "image"
                ) {

                    note.innerHTML =
                        `<img src="${memory.mediaData}" alt="">`;

                } else {

                    note.classList.add(
                        "video"
                    );

                    note.innerHTML =
                        "🎥";
                }

            } else {

                note.textContent =
                    memory.title;

            }


            note.addEventListener(
                "click",
                () => openMemory(memory)
            );


            memoryInsideJar.appendChild(
                note
            );

        }
    );

}


/* --------------------------------------------------
   RENDER GALLERY
-------------------------------------------------- */

function renderGallery() {

    emptyState.style.display =
        memories.length
            ? "none"
            : "block";


    /*
       Remove existing cards
       while keeping empty state.
    */

    document
        .querySelectorAll(".memory-card")
        .forEach(card => card.remove());


    memories.forEach(
        memory => {

            const card =
                document.createElement("article");


            card.className =
                "memory-card";


            let mediaHTML =
                `<div class="memory-image">💌</div>`;


            if (
                memory.mediaData &&
                memory.mediaType === "image"
            ) {

                mediaHTML =
                    `
                    <img
                        class="memory-image"
                        src="${memory.mediaData}"
                        alt="${escapeHTML(memory.title)}"
                    >
                    `;

            }


            if (
                memory.mediaData &&
                memory.mediaType === "video"
            ) {

                mediaHTML =
                    `
                    <div class="memory-image"
                         style="
                         display:flex;
                         align-items:center;
                         justify-content:center;
                         font-size:45px;
                         ">
                        🎥
                    </div>
                    `;

            }


            card.innerHTML = `

                ${mediaHTML}

                <h3>
                    ${escapeHTML(memory.title)}
                </h3>

                <p>
                    ${escapeHTML(memory.text)}
                </p>

                <div class="memory-date">
                    ${memory.date}
                </div>

            `;


            card.addEventListener(
                "click",
                () => openMemory(memory)
            );


            memoryGrid.appendChild(card);

        }
    );

}


/* --------------------------------------------------
   OPEN MEMORY
-------------------------------------------------- */

function openMemory(memory) {

    let mediaHTML = "";


    if (
        memory.mediaData &&
        memory.mediaType === "image"
    ) {

        mediaHTML =
            `
            <img
                src="${memory.mediaData}"
                alt="${escapeHTML(memory.title)}"
            >
            `;

    }


    if (
        memory.mediaData &&
        memory.mediaType === "video"
    ) {

        mediaHTML =
            `
            <video
                src="${memory.mediaData}"
                controls
            ></video>
            `;

    }


    viewMemory.innerHTML = `

        <p class="small-title">
            MEMORY
        </p>

        <h2 class="view-title">
            ${escapeHTML(memory.title)}
        </h2>

        <p class="view-text">
            ${escapeHTML(memory.text)}
        </p>

        ${mediaHTML}

        <p class="memory-date">
            ${memory.date}
        </p>

        <button
            class="delete-memory"
            id="deleteMemoryBtn"
        >
            Delete this memory
        </button>

    `;


    viewModal.classList.add(
        "active"
    );


    document
        .getElementById(
            "deleteMemoryBtn"
        )
        .addEventListener(
            "click",
            () => deleteMemory(memory.id)
        );

}


/* --------------------------------------------------
   DELETE MEMORY
-------------------------------------------------- */

function deleteMemory(id) {

    memories =
        memories.filter(
            memory =>
                memory.id !== id
        );


    saveMemories();

    renderMemories();

    viewModal.classList.remove(
        "active"
    );

    showToast(
        "Memory removed."
    );

}


/* --------------------------------------------------
   CLEAR EVERYTHING
-------------------------------------------------- */

clearAllBtn.addEventListener(
    "click",
    () => {

        if (!memories.length) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete all your memories?"
            );


        if (!confirmed) {
            return;
        }


        memories = [];

        saveMemories();

        renderMemories();

        showToast(
            "Your jar has been emptied."
        );

    }
);


/* --------------------------------------------------
   ANIMATION
-------------------------------------------------- */

function animateMemoryIntoJar() {

    const note =
        document.createElement("div");


    note.className =
        "jar-memory";


    note.textContent =
        "New! 💌";


    note.style.position =
        "fixed";


    note.style.left =
        "50%";


    note.style.top =
        "15%";


    note.style.zIndex =
        "500";


    note.style.transform =
        "translate(-50%, -50%) rotate(20deg)";


    document.body.appendChild(note);


    const jar =
        document
            .querySelector(".jar-body")
            .getBoundingClientRect();


    requestAnimationFrame(
        () => {

            note.style.transition =
                "all 1s cubic-bezier(.2,.8,.2,1)";

            note.style.left =
                `${jar.left + jar.width / 2}px`;

            note.style.top =
                `${jar.top + jar.height * 0.75}px`;

            note.style.transform =
                "translate(-50%, -50%) rotate(-15deg) scale(.7)";

            note.style.opacity =
                "0";

        }
    );


    setTimeout(
        () => note.remove(),
        1100
    );

}


/* --------------------------------------------------
   TOAST
-------------------------------------------------- */

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* --------------------------------------------------
   RANDOM NUMBER
-------------------------------------------------- */

function randomNumber(min, max) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


/* --------------------------------------------------
   SECURITY
-------------------------------------------------- */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


/* --------------------------------------------------
   START WEBSITE
-------------------------------------------------- */

renderMemories();