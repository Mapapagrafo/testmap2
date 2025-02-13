import { register } from "https://unpkg.com/@owlbear-rodeo/sdk";

const plugin = await register("image-deformer");

plugin.onReady(() => {
    console.log("Extensão de deformação de imagem carregada!");

    // Criar botão no menu do Owlbear para ativar a ferramenta
    plugin.ui.addButton({
        title: "Deformar Imagem",
        icon: "🔧",
        onClick: () => openDeformTool(),
    });
});

function openDeformTool() {
    const selection = plugin.selection.getSelectedItems();
    if (selection.length === 0) {
        plugin.ui.showNotification("Selecione uma imagem para deformar.");
        return;
    }

    const image = selection[0];

    // Criar painel de deformação
    plugin.ui.showPanel({
        title: "Deformação de Imagem",
        render: (container) => {
            container.innerHTML = `
                <p>Arraste os vértices para deformar a imagem.</p>
                <canvas id="deformCanvas"></canvas>
            `;

            const canvas = document.getElementById("deformCanvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");

            // Inicializa os vértices da imagem
            const vertices = [
                { x: 0, y: 0 },
                { x: canvas.width, y: 0 },
                { x: canvas.width, y: canvas.height },
                { x: 0, y: canvas.height },
            ];

            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                
                // Desenha os vértices
                ctx.fillStyle = "red";
                vertices.forEach((v) => {
                    ctx.beginPath();
                    ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            draw();

            // Adicionar evento de arrastar vértices
            let draggingVertex = null;
            canvas.addEventListener("mousedown", (event) => {
                const x = event.offsetX;
                const y = event.offsetY;

                vertices.forEach((v, index) => {
                    if (Math.hypot(v.x - x, v.y - y) < 10) {
                        draggingVertex = index;
                    }
                });
            });

            canvas.addEventListener("mousemove", (event) => {
                if (draggingVertex === null) return;
                vertices[draggingVertex].x = event.offsetX;
                vertices[draggingVertex].y = event.offsetY;
                draw();
            });

            canvas.addEventListener("mouseup", () => {
                draggingVertex = null;
            });
        },
    });
}
