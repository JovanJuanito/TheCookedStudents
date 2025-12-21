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
            dropZone.style.left = "0vh";
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
        newUtensil.style.left = "0vh";
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
                // 1. Get current username
                const res = await fetch("/userLogin.json");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        username = data[data.length - 1].username;
                    }
                }

                // 2. Save Score
                await fetch("/score", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: username,
                        score: parseFloat(timeTaken),
                        type: "Burger & Fries"
                    })
                });

            } catch (e) {
                console.error("Error saving score:", e);
            }

            setTimeout(() => {
                dropZone.innerHTML = `
                    <div style="text-align: center; font-family: 'Segoe UI', sans-serif;">
                        <h1 style="color: #333; margin-bottom: 10px;">Stage Complete!!</h1>
                        
                        <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 20px auto; max-width: 300px;">
                            <h3 style="color: #ff6b6b; margin: 0 0 10px 0;">Scoreboard</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; color: #555;">
                                <span>Player:</span>
                                <span style="color: #333;">${username}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-weight: bold; color: #555;">
                                <span>Dish:</span>
                                <span style="color: #333;">Burger & Fries</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #555;">
                                <span>Time:</span>
                                <span style="color: #333;">${timeTaken}s</span>
                            </div>
                        </div>

                        <a href="../index.html" style="text-decoration: none;">
                            <button type="button" style="
                                padding: 12px 24px;
                                background: #4ecdc4;
                                color: white;
                                border: none;
                                border-radius: 25px;
                                font-size: 1.1rem;
                                font-weight: bold;
                                cursor: pointer;
                                transition: transform 0.2s;
                                box-shadow: 0 4px 10px rgba(78, 205, 196, 0.4);
                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                Back to Kitchen
                            </button>
                        </a>
                    </div>
                `;
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
                        "left:15vh; top:15vh; width:80%; height:80%; border-radius:15px; display:flex; flex-direction:column;"
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

        new Audio("../sounds/Koi.MP3").play();
        document.getElementById("start").remove();

        const drop = document.createElement("div");
        drop.id = "dropzone";
        drop.innerHTML = "Drop Here !";

        document.body.appendChild(drop);
        dropZone = drop;

        spawnNewUtensil();
    });

    window.addEventListener("mousedown", () => {
        new Audio("../sounds/Click_Sound_Effect.mp3").play();
    });

});
