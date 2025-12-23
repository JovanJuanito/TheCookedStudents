document.addEventListener("DOMContentLoaded", () => {
    let date = new Date();
    let timer;
    const recipe = ["frying_pan", "oil", "diced_onion", "egg", "rice", "soy_sauce", "salt", "spoon", "plate", "done"];
    const action = ["utensil", "ingredient", "ingredient", "ingredient", "ingredient", "ingredient", "ingredient", "act", "utensil"];
    const pan_stage = ["frying_pan", "frying_pan_oil", "frying_pan_onion", "frying_pan_egg", "frying_pan_rice", "frying_pan_soy_sauce", "frying_pan_soy_sauce", "frying_pan_fried_rice"];

    let stage = 0;
    let counter = 0;
    let dropZone;

    let dragging = null;
    let offsetX = 0;
    let offsetY = 0;

    let utensil;
    let active_utensil;

    let completed = false;

    document.getElementById("start").addEventListener("click", () => {
        timer = date.getTime();
        spawnNewUtensil();
        document.getElementById("start").remove();
        let drop = document.createElement("div");
        drop.innerHTML = "Drop Here !";
        drop.id = "dropzone";
        document.body.appendChild(drop);
        dropZone = drop;
        const click = new Audio("../sounds/Koi.MP3");
        click.play();
    });

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

    // Snap function
    function snapToDrop(dragging, dropZone) {
        const dzRect = dropZone.getBoundingClientRect();
        const dzCenterXPercent = ((dzRect.left + dzRect.width / 2) / window.innerWidth) * 100;
        const dzCenterYPercent = ((dzRect.top + dzRect.height / 2) / window.innerHeight) * 100;

        const elRect = dragging.getBoundingClientRect();

        dragging.style.left = (dzCenterXPercent - (elRect.width / 2 / window.innerWidth * 100)) + "vw";
        dragging.style.top = (dzCenterYPercent - (elRect.height / 2 / window.innerHeight * 100)) + "vh";
    }

    function spawnNewUtensil() {
        const newUtensil = document.createElement("div");
        newUtensil.className = "utensils";
        newUtensil.setAttribute("id", recipe[counter]);
        if (recipe[counter] == "done") {
            return;
        }
        else {
            newUtensil.innerHTML = `<img src="../image/${recipe[counter]}.png">`;
        }

        // position it somewhere initial
        newUtensil.style.left = "0vh";
        newUtensil.style.top = "47vh";

        document.body.appendChild(newUtensil);
        if (recipe[counter] == "plate") {
            newUtensil.style.pointerEvents = "none";
            utensil = active_utensil;
            utensil.style.pointerEvents = "all";
            dropZone.style.left = "0vh";
            dropZone.style.top = " 47vh";
            enableDrag(utensil);
        }
        else {
            utensil = document.getElementById(recipe[counter]);
            enableDrag(newUtensil);
        }


    }

    function enableDrag(el) {
        if (el.dataset.draggable) return;
        el.dataset.draggable = "true";

        el.addEventListener("mousedown", e => {
            dragging = el;
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            el.style.cursor = `url("../image/grab.png"),auto`;
            el.style.zIndex = 1000;
        });
    }

    document.addEventListener("mousemove", e => {
        if (!dragging) return;
        dragging.style.left = ((e.clientX - offsetX) / window.innerWidth * 100) + "vw";
        dragging.style.top = ((e.clientY - offsetY) / window.innerHeight * 100) + "vh";
    });

    document.addEventListener("mouseup", async () => {
        if (!dragging) return;

        const release = dragging;

        if (recipe[counter] == "done" && !completed) {
            completed = true;
            snapToDrop(release, dropZone);

            // Fetch user data & Save Score
            let username = "Guest";
            const timeTaken = ((new Date().getTime() - timer) / 1000).toFixed(2);

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
                            type: "Fried Rice"
                        })
                    }
                );

            } catch (e) {
                console.error("Save failed:", e);
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
                                <span style="color: #333;">Fried Rice</span>
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
                    </div>`;
            }, 40);

            dragging.remove();
            return;
        }

        if (isColliding(release, dropZone)) {
            snapToDrop(release, dropZone);
            if (action[counter++] == "utensil") {
                if (recipe[counter] == "done") {
                    dropZone.setAttribute("style", "left : 15vh; top : 15vh; width : 80% ; height : 80% ; border-radius: 15px; display : flex; flex-direction: column;");
                    dropZone.innerHTML = "Serve";
                    dragging.style.pointerEvents = "none";
                    active_utensil.innerHTML = "";
                    let newUtensil = document.getElementById("plate");
                    newUtensil.style.pointerEvents = "all";
                    newUtensil.innerHTML = "<img src='../image/plate_fried_rice.png'>";
                    enableDrag(newUtensil);
                }
                dragging.classList.remove("utensils");
                dragging.classList.add("done");
                active_utensil = utensil;

            }
            else {
                stage++;
                active_utensil.innerHTML = "";
                dragging.remove();

                const newpan = document.createElement("img");
                newpan.src = `../image/${pan_stage[stage]}.png`;
                newpan.style.pointerEvents = "none";
                active_utensil.appendChild(newpan);
            }

            spawnNewUtensil()
        }

        dragging.style.cursor = `url("../image/grab.png"),auto`;
        dragging.style.zIndex = 1;
        dragging = null;
    });

    window.addEventListener("mousedown", () => { const click = new Audio("../sounds/Click_Sound_Effect.mp3"); click.play(); });

});

