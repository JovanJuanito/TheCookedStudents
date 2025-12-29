document.addEventListener("DOMContentLoaded", () => {

    /* =======================
       GAME DATA
    ======================= */

    const recipe = [
        "frying_pan", "oil", "beef_patty", "spatula",
        "cheese", "salt", "pickle", "plate_buns",
        "fries", "plating", "done"
    ];

    const action = [
        "utensil", "ingredient", "ingredient", "ingredient",
        "ingredient", "ingredient", "ingredient", "utensil",
        "ingredient", "utensil"
    ];

    const pan_stage = [
        "frying_pan",
        "frying_pan_oil",
        "frying_pan_raw_patty",
        "frying_pan_cooked_patty",
        "frying_pan_patty_cheese",
        "frying_pan_patty_cheese",
        "frying_pan_patty_cheese_pickle",
        "frying_pan_oil",
        "frying_pan_fries"
    ];

    const plate_stage = [
        "plate_burger",
        "plate_burger_fries"
    ];

    /* =======================
       GAME STATE
    ======================= */

    let timer;
    let stage = 0;
    let counter = 0;
    let pstage = -1;
    let completed = false;

    /* =======================
       DRAG STATE
    ======================= */

    let dropZone;
    let dragging = null;
    let offsetX = 0;
    let offsetY = 0;

    let utensil;
    let active_utensil;

    /* =======================
       HELPERS
    ======================= */

    function isColliding(a, b) {
        const rect1 = a.getBoundingClientRect();
        const rect2 = b.getBoundingClientRect();

        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }

    function snapToDrop(el, zone) {
        const dzRect = zone.getBoundingClientRect();

        const centerX =
            ((dzRect.left + dzRect.width / 2) / window.innerWidth) * 100;
        const centerY =
            ((dzRect.top + dzRect.height / 2) / window.innerHeight) * 100;

        const elRect = el.getBoundingClientRect();

        el.style.left =
            centerX - (elRect.width / 2 / window.innerWidth * 100) + "vw";
        el.style.top =
            centerY - (elRect.height / 2 / window.innerHeight * 100) + "vh";
    }

    function enableDrag(el) {
        if (el.dataset.draggable) return;

        el.dataset.draggable = "true";

        el.addEventListener("mousedown", e => {
            dragging = el;

            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            el.style.cursor = `url("../image/grab.png"), auto`;
            el.style.zIndex = 1000;
        });
    }

    /* =======================
       SPAWN LOGIC
    ======================= */

    function spawnNewUtensil() {

        if (recipe[counter] === "plating") {
            dropZone.style.left = "0vw";
            dropZone.style.top = "47vh";
            return;
        }

        if (recipe[counter] === "done") {
            const plate = document.getElementById("plate_buns");
            plate.innerHTML = "";

            pstage++;

            const newPlate = document.createElement("img");
            newPlate.src = `../image/${plate_stage[pstage]}.png`;
            newPlate.style.pointerEvents = "none";

            plate.appendChild(newPlate);
            enableDrag(plate);
            return;
        }

        const newUtensil = document.createElement("div");
        newUtensil.className = "utensils";
        newUtensil.id = recipe[counter];
        newUtensil.style.left = "0vw";
        newUtensil.style.top = "47vh";

        newUtensil.innerHTML =
            `<img src="../image/${recipe[counter]}.png">`;

        document.body.appendChild(newUtensil);

        if (recipe[counter] === "plate_buns") {
            newUtensil.style.pointerEvents = "none";

            utensil = active_utensil;
            utensil.style.pointerEvents = "all";

            dropZone.style.left = "0vw";
            dropZone.style.top = "47vh";

            enableDrag(utensil);
            return;
        }

        if (recipe[counter] === "fries") {
            utensil = document.getElementById(recipe[counter]);

            utensil.style.left = "0vw";
            utensil.style.top = "20vh";

            dropZone.style.left = "32vw";
            dropZone.style.top = "47vh";

            enableDrag(utensil);
            return;
        }

        utensil = newUtensil;
        enableDrag(newUtensil);
    }

    /* =======================
       DRAG EVENTS
    ======================= */

    document.addEventListener("mousemove", e => {
        if (!dragging) return;

        dragging.style.left =
            ((e.clientX - offsetX) / window.innerWidth * 100) + "vw";
        dragging.style.top =
            ((e.clientY - offsetY) / window.innerHeight * 100) + "vh";
    });

    document.addEventListener("mouseup", async () => {
        if (!dragging) return;

        const released = dragging;

        if (recipe[counter] === "done" && !completed) {
            completed = true;

            snapToDrop(released, dropZone);

            // Fetch user data & Save Score
            let username = "Guest";
            const timeTaken = ((Date.now() - timer) / 1000).toFixed(2);

           try {
                const res = await fetch(
                    "/userLogin.json"
                );

                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        username = data[data.length - 1].username;
                    }
                }

                await fetch(
                    "/saveScore.php",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            username,
                            score: parseFloat(timeTaken),
                            type: "Burger & Fries"
                        })
                    }
                );

            } catch (e) {
                console.log("Running in offline mode - score not saved");
            }

            setTimeout(() => {
                // Remove dropzone entirely or clear it for the modal
                dropZone.style.display = 'none';

                const modal = document.createElement('div');
                modal.className = 'success-modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <h1>Stage Complete!</h1>
                        <div class="score-card">
                            <div class="score-row">
                                <span>Player</span>
                                <span class="score-val">${username}</span>
                            </div>
                            <div class="score-row">
                                <span>Dish</span>
                                <span class="score-val">Burger & Fries</span>
                            </div>
                            <div class="score-row">
                                <span>Time</span>
                                <span class="score-val">${timeTaken}s</span>
                            </div>
                        </div>
                        <a href="../index.html" class="btn-kitchen">
                            Back to Kitchen
                        </a>
                    </div>
                `;
                document.body.appendChild(modal);
            }, 40);

            released.remove();
            return;
        }

        if (isColliding(released, dropZone)) {
            snapToDrop(released, dropZone);

            if (action[counter++] === "utensil") {

                if (recipe[counter] === "done") {
                    dropZone.setAttribute(
                        "style",
                        "left:15vw; top:15vh; width:80%; height:80%; border-radius:15px; display:flex; flex-direction:column;"
                    );

                    dropZone.innerHTML = "Serve";
                    released.style.pointerEvents = "none";

                    active_utensil.innerHTML = "";

                    const plate = document.getElementById("plate_buns");
                    plate.style.pointerEvents = "all";
                    plate.innerHTML =
                        "<img src='../image/plate_burger_fries.png'>";

                    enableDrag(plate);
                }

                if (recipe[counter] === "oil") {
                    released.classList.remove("utensils");
                    released.classList.add("done");
                    active_utensil = utensil;

                    // === SPECIFIC REQUEST: Drop Zone Transparency ===
                    // When oil is added (or rather, just after pan is placed? Wait. "first interaction with frying_pan or pot")
                    // In the recipe list: "frying_pan", "oil".
                    // This block executes when "oil" is the CURRENT required item, meaning PAN was just successfully placed.
                    // Wait, no. When `frying_pan` is dragging, `counter` is 0. 
                    // `action[0]` is 'utensil'.
                    // It enters `if (action... == 'utensil')`.
                    // It checks `recipe[1]` (since counter++ happened). `recipe[1]` is 'oil'.
                    // So it enters THIS block when the pan is placed.
                    
                    dropZone.classList.add("cooking-active");
                    dropZone.innerText = "";
                }

                else if (recipe[counter] === "fries") {
                    const plate = document.getElementById("plate_buns");
                    plate.innerHTML = "";

                    released.style.left = "35vw";
                    released.style.top = "42vh";

                    pstage++;

                    const newPlate = document.createElement("img");
                    newPlate.src = `../image/${plate_stage[pstage]}.png`;
                    newPlate.style.pointerEvents = "none";
                    plate.appendChild(newPlate);

                    stage++;
                    active_utensil.innerHTML = "";

                    const newPan = document.createElement("img");
                    newPan.src = `../image/${pan_stage[stage]}.png`;
                    newPan.style.pointerEvents = "none";
                    active_utensil.appendChild(newPan);
                }

            } else {
                stage++;
                active_utensil.innerHTML = "";
                released.remove();

                const newPan = document.createElement("img");
                newPan.src = `../image/${pan_stage[stage]}.png`;
                newPan.style.pointerEvents = "none";
                active_utensil.appendChild(newPan);
            }

            spawnNewUtensil();
        }

        released.style.cursor = `url("../image/grab.png"), auto`;
        released.style.zIndex = 1;
        dragging = null;
    });

    /* =======================
       START BUTTON
    ======================= */

    document.getElementById("start").addEventListener("click", () => {
        timer = Date.now();
        
        // Use CSS class for transition instead of removing
        const startOverlay = document.getElementById("start");
        startOverlay.style.opacity = "0";
        setTimeout(() => startOverlay.remove(), 500);

        const drop = document.createElement("div");
        drop.innerText = "Drop Here!"; // Changed from innerHTML to innerText for font control
        drop.id = "dropzone";

        document.body.appendChild(drop);
        dropZone = drop;

        spawnNewUtensil();
    });

    window.addEventListener("mousedown", () => {
        try {
            new Audio("../sounds/Click_Sound_Effect.mp3").play();
        } catch (e) {
            // Audio file not found, continue without sound
        }
    });

});
