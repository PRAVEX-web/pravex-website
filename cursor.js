/* =======================================================
    |  PRAVEX — BLUE GAME CURSOR + SMOOTH FADING TRAIL  |
   ======================================================= */
(() => {
    /* Desktop only */
    if (window.matchMedia("(pointer: coarse)").matches) return;

    /* ================= CANVAS ================= */
    const canvas = document.createElement("canvas");
    canvas.id = "pravex-cursor";

    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    /* ================= RESIZE ================= */
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    /* ================= MOUSE ================= */
    let mouseX = width / 2;
    let mouseY = height / 2;

    let currentX = mouseX;
    let currentY = mouseY;

    let previousX = mouseX;
    let previousY = mouseY;


    /* FIXED CURSOR ANGLE */

    const angle = -Math.PI / 1.5;

    let lastMove = performance.now();


    window.addEventListener("mousemove", (e) => {

        mouseX = e.clientX;
        mouseY = e.clientY;

        lastMove = performance.now();

    });


    /* ================= TRAIL ================= */

    const trail = [];

    const MAX_TRAIL = 500;


    /* ================= ANIMATION ================= */
    function animate() {

        ctx.clearRect(0, 0, width, height);

        /* -----------------------------------------
           SMOOTH CURSOR MOVEMENT
        ----------------------------------------- */
        const oldX = currentX;
        const oldY = currentY;

        currentX += (mouseX - currentX) * 0.45;
        currentY += (mouseY - currentY) * 0.45;

        const dx = currentX - oldX;
        const dy = currentY - oldY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        /* -----------------------------------------
           ADD EXTRA POINTS FOR FAST MOVEMENT
        ----------------------------------------- */
        if (distance > 0.3) {
            /*
             * Instead of adding only one point,
             * divide large movements into smaller
             * points.
             * This prevents gaps/connectors when
             * the mouse moves quickly.
             */
            const steps = Math.max(1, Math.ceil(distance / 6));

            for (let i = 1; i <= steps; i++) {
                const t = i / steps;

                trail.unshift({
                    x: oldX + dx * t,
                    y: oldY + dy * t,
                    life: 1
                });
            }
        }

        /* Limit trail */
        if (trail.length > MAX_TRAIL) {
            trail.length = MAX_TRAIL;
        }

        /* -----------------------------------------
           SMOOTH FADING TRAIL
        ----------------------------------------- */
        if (trail.length > 2) {
            /* Draw from the oldest point toward
               the cursor using smooth quadratic
               curves */
            for (let i = trail.length - 2; i >= 0; i--) {
                const current = trail[i];
                const next = trail[i + 1];
                const age = i / trail.length;

                /*
                 * Strong near cursor.
                 * Very soft at the back.
                 */
                const fade = Math.pow(1 - age, 0.8) * current.life;

                /* Midpoint makes the path smooth */
                const midX = (current.x + next.x) / 2;
                const midY = (current.y + next.y) / 2;

                /* =================================
                   OUTER GLOW
                ================================= */
                ctx.beginPath();

                ctx.moveTo(current.x, current.y);

                ctx.quadraticCurveTo(current.x, current.y, midX, midY);

                ctx.lineCap = "round";
                ctx.lineJoin = "round";

                ctx.strokeStyle = `rgba(147, 112, 219, ${fade * 0.24})`;

                ctx.lineWidth = 7 * (1 - age * 0.65);

                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(0, 128, 0, ${fade * 0.75})`;

                ctx.stroke();

                /* =================================
                   INNER LIGHT
                ================================= */
                ctx.beginPath();

                ctx.moveTo(current.x, current.y);
                ctx.quadraticCurveTo(current.x, current.y, midX, midY);

                ctx.lineCap = "round";
                ctx.strokeStyle = `rgba(0, 0, 255, ${fade * 0.70})`;
                ctx.lineWidth = 2 * (1 - age * 0.5);

                ctx.shadowBlur = 4;
                ctx.shadowColor = `rgba(255, 192, 203, ${fade})`;

                ctx.stroke();
            }
        }

        /* -----------------------------------------
           FADE OLD TRAIL
        ----------------------------------------- */
        for (let i = trail.length - 1; i >= 0; i--) {

            trail[i].life -= 0.035;

            if (trail[i].life <= 0) {
                trail.splice(i, 1);
            }
        }

        /* -----------------------------------------
           GAME-STYLE POINTED CURSOR
        ----------------------------------------- */
        ctx.save();

        ctx.translate(
            currentX,
            currentY
        );

        /* Fixed orientation.
           It DOES NOT rotate with the mouse. */
        ctx.rotate(angle);

        /* Cursor glow */
        ctx.shadowBlur = 13;
        ctx.shadowColor = "rgba(89, 52, 148, 0.95)";


        /* Pointed cursor */
        ctx.beginPath();

        ctx.moveTo(10, 0);
        ctx.lineTo(-5, -6);
        ctx.lineTo(-1, 0);
        ctx.lineTo(-5, 7);

        ctx.closePath();

        /* Blue / white gradient */
        const cursorGradient = ctx.createLinearGradient(10, 0, -4, 0);

        cursorGradient.addColorStop(0, "#ffffff");
        cursorGradient.addColorStop(0.25, "#bb72ff");
        cursorGradient.addColorStop(0.65, "#a200ff");
        cursorGradient.addColorStop(1, "#8c00ff");

        ctx.fillStyle = cursorGradient;
        ctx.fill();

        /* Thin outline */
        ctx.shadowBlur = 0;

        ctx.strokeStyle = "#ffffff";

        ctx.lineWidth = 0.8;

        ctx.stroke();
        ctx.restore();


        /* -----------------------------------------
           VERY SUBTLE IDLE GLOW
        ----------------------------------------- */
        if (performance.now() - lastMove > 100) {
            const idleGlow = ctx.createRadialGradient
            (
                currentX, currentY, 0,
                currentX, currentY, 5
            );

            idleGlow.addColorStop(0, "rgba(0, 221, 255, 0.04)");
            idleGlow.addColorStop(1, "rgba(0, 120, 255, 0)");

            ctx.fillStyle = idleGlow;

            ctx.beginPath();
            ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(animate);
    }
    animate();

})();