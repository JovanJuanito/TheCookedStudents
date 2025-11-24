document.addEventListener("DOMContentLoaded", () => {
    let date = new Date();
    let timer = date.getTime();
    const recipe = ["frying_pan","oil" ,"diced_onion", "egg", "rice" ,"soy_sauce" ,"salt","spoon","plate","done"];
    const action = ["utensil", "ingredient", "ingredient","ingredient","ingredient","ingredient","ingredient","act","utensil"];
    const pan_stage = ["frying_pan","frying_pan_oil","frying_pan_onion","frying_pan_egg","frying_pan_rice","frying_pan_soy_sauce","frying_pan_soy_sauce","frying_pan_fried_rice"];


    let stage = 0;
    let counter = 0;
    const dropZone = document.getElementById("dropzone");

    let dragging = null;
    let offsetX = 0;
    let offsetY = 0;

    let utensil;
    let active_utensil;

    spawnNewUtensil();
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
        newUtensil.setAttribute("id",recipe[counter]);
        if(recipe[counter]== "done"){
            return;
        }
        else{
            newUtensil.innerHTML = `<img src="../image/${recipe[counter]}.png">`;
        }
        
        // position it somewhere initial
        newUtensil.style.left = "0vh";
        newUtensil.style.top = "47vh";

        document.body.appendChild(newUtensil);
        if(recipe[counter]== "plate"){
            newUtensil.style.pointerEvents = "none";
            utensil = active_utensil;
            active_utensil.style.pointerEvents = "all";
            dropZone.style.left = "0vh" ;
            dropZone.style.top = " 47vh";
            utensil.addEventListener("mousedown", e => {
                dragging = utensil;
                const rect = utensil.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                utensil.style.cursor = `url("../image/grab.png"),auto`;
                utensil.style.zIndex = 1000;
            });
        }
        else{
            utensil = document.getElementById(recipe[counter]);
            newUtensil.addEventListener("mousedown", e => {
                dragging = newUtensil;
                const rect = newUtensil.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                newUtensil.style.cursor = `url("../image/grab.png"),auto`;
                newUtensil.style.zIndex = 1000;
            });
        }
        
        
    }

    utensil.addEventListener("mousedown", e => {
        dragging = utensil;
        const rect = utensil.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        utensil.style.cursor = `url("../image/grab.png"),auto`;
        utensil.style.zIndex = 1000;
    });

    document.addEventListener("mousemove", e => {
        if (!dragging) return;
        dragging.style.left = ((e.clientX - offsetX)/window.innerWidth*100) + "vw";
        dragging.style.top = ((e.clientY - offsetY)/window.innerHeight*100) + "vh";
    });

    document.addEventListener("mouseup", () => {
        if(recipe[counter] == "done"){
            snapToDrop(dragging, dropZone);
            setTimeout(() => {
                dropZone.innerHTML = `
                    <h1>Stage Complete!!</h1>
                    <h2>Completion time: `+ (new Date().getTime() - timer)/1000+`</h2>
                    <a href="../index.html">
                        <button type="button">Press to go back to main page</button>
                    </a>`;
            }, 40);
            
            dragging.remove();
            return;
        }

        if (!dragging) return;

        if (isColliding(dragging, dropZone)) {
            snapToDrop(dragging, dropZone);
            if(action[counter++] == "utensil"){
                if(recipe[counter] == "done"){
                    dropZone.setAttribute("style", "left : 15vh; top : 15vh; width : 80% ; height : 80% ; border-radius: 15px; display : flex; flex-direction: column;");
                    dropZone.innerHTML = "Serve";
                    dragging.style.pointerEvents = "none";
                    active_utensil.innerHTML ="";
                    let newUtensil = document.getElementById("plate");
                    newUtensil.style.pointerEvents ="all";
                    newUtensil.innerHTML = "<img src='../image/plate_fried_rice.png'>";
                    newUtensil.addEventListener("mousedown", e => {
                        dragging = newUtensil;
                        const rect = newUtensil.getBoundingClientRect();
                        offsetX = e.clientX - rect.left;
                        offsetY = e.clientY - rect.top;
                        newUtensil.style.cursor = `url("../image/grab.png"),auto`;
                        newUtensil.style.zIndex = 1000;
                    });
                }
                dragging.classList.remove("utensils");
                dragging.classList.add("done");
                active_utensil = utensil;
                
            }
            else{
                dragging.style.display = "none";
                stage++;

                active_utensil.innerHTML ="";
                dragging.remove();

                const newpan = document.createElement("img");
                newpan.src = `../image/${pan_stage[stage]}.png`;
                active_utensil.appendChild(newpan);
            }
            
            spawnNewUtensil()
        }

        dragging.style.cursor = `url("../image/grab.png"),auto`;
        dragging.style.zIndex = 1;
        dragging = null;
    });

    window.addEventListener("mousedown", () => {const click = new Audio("../sounds/Click_Sound_Effect.mp3"); click.play(); });

});
