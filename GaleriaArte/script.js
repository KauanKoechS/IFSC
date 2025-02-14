//--------------------------------------------------------------------- =Configuração inicial do Three.js= ---------------------------------------------------------------------//
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas3D") });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//--------------------------------------------------------------------- =Configurações da Iluminação= ---------------------------------------------------------------------//
// Adicionando luz ambiente e luz direcional
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);
//--------------------------------------------------------------------- =Configurações Estruturais= ---------------------------------------------------------------------//
//--------------------------------------------------------------------- =Sala=
// Função para criar paredes, chão e teto
function createWall(width, height, depth, color, position) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(position.x, position.y, position.z);
    scene.add(wall);
}

// Criando chão
createWall(20, 0.2, 20, 0x808080, { x: 0, y: -0.1, z: 0 });

// Criando paredes
createWall(20, 5, 0.2, 0xffffff, { x: 0, y: 2.5, z: -10 }); // Parede de fundo
createWall(20, 5, 0.2, 0xffffff, { x: 0, y: 2.5, z: 10 }); // Parede da frente
createWall(0.2, 5, 20, 0xffffff, { x: -10, y: 2.5, z: 0 }); // Parede esquerda
createWall(0.2, 5, 20, 0xffffff, { x: 10, y: 2.5, z: 0 }); // Parede direita

// Criando teto
createWall(20, 0.2, 20, 0xaaaaaa, { x: 0, y: 5, z: 0 });
//--------------------------------------------------------------------- =Quadros=
// Carregador de texturas
const textureLoader = new THREE.TextureLoader();

// Função para criar um quadro com textura
function createFrame(width, height, texturePath, position) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const texture = textureLoader.load(texturePath); // Carregar textura
    const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
    const frame = new THREE.Mesh(geometry, material);
    frame.position.set(position.x, position.y, position.z);
    frame.rotation.y = Math.PI; // Virar para a frente da galeria
    scene.add(frame);
}

// Criando quadros com texturas
createFrame(3, 2, "textures/colossus.jpg", { x: -5, y: 2.5, z: -9.8 }); // Quadro esquerdo
createFrame(3, 2, "textures/matrix.jpg", { x: 0, y: 2.5, z: -9.8 }); // Quadro central
createFrame(3, 2, "textures/colossus2.jpg", { x: 5, y: 2.5, z: -9.8 }); // Quadro direito

//--------------------------------------------------------------------- =Esculturas=
// Função para criar uma escultura
function createSculpture(radius, height, color, position) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshStandardMaterial({ color });
    const sculpture = new THREE.Mesh(geometry, material);
    sculpture.position.set(position.x, position.y, position.z);
    scene.add(sculpture);
}

// Criando esculturas no chão
createSculpture(1, 3, 0x808080, { x: -3, y: 1.5, z: 0 }); // Escultura esquerda
createSculpture(1, 3, 0x808080, { x: 3, y: 1.5, z: 0 }); // Escultura direita

//--------------------------------------------------------------------- =Configurações da Câmera= ---------------------------------------------------------------------//
// Posicionando a câmera dentro da galeria
camera.position.set(0, 2, 10);
camera.lookAt(0, 2, 0);

// Variáveis para controle da câmera
let moveSpeed = 0.2;  // Velocidade de movimento
let rotationSpeed = 0.002;  // Sensibilidade do mouse
let keys = {};  // Armazena teclas pressionadas
let isMouseDown = false;  // Controle do clique do mouse
let lastMouseX = 0;  // Última posição X do mouse
let lastMouseY = 0;  // Última posição Y do mouse

// Variáveis de ângulo para controle suave da rotação
let pitch = 0; // Controle da rotação X (cima/baixo)
let yaw = 0;   // Controle da rotação Y (esquerda/direita)

// Evento para capturar teclas pressionadas
window.addEventListener("keydown", (event) => {
    keys[event.key] = true;
});

window.addEventListener("keyup", (event) => {
    keys[event.key] = false;
});

// Evento para capturar movimento do mouse ao pressionar o botão direito
window.addEventListener("mousedown", (event) => {
    if (event.button === 0) {  // Botão esquerdo do mouse
        isMouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

window.addEventListener("mouseup", () => {
    isMouseDown = false;
});

window.addEventListener("mousemove", (event) => {
    if (isMouseDown) {
        let deltaX = event.clientX - lastMouseX;
        let deltaY = event.clientY - lastMouseY;

        // Atualiza os ângulos Yaw (esquerda/direita) e Pitch (cima/baixo)
        yaw -= deltaX * rotationSpeed;
        pitch -= deltaY * rotationSpeed;

        // Limita a rotação Pitch para não virar de cabeça para baixo
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

        // Atualiza a rotação da câmera com Quaternions
        let quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, "YXZ"));
        camera.quaternion.copy(quaternion);

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

// Atualiza a posição da câmera com base nas teclas pressionadas
function updateCameraMovement() {
    let direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    if (keys["w"]) {
        camera.position.addScaledVector(direction, moveSpeed);
    }
    if (keys["s"]) {
        camera.position.addScaledVector(direction, -moveSpeed);
    }
}


//--------------------------------------------------------------------- =Iniciar Funções= ---------------------------------------------------------------------//
// Função de animação
function animate() {
    requestAnimationFrame(animate);
    updateCameraMovement();  // Atualiza posição da câmera
    renderer.render(scene, camera);
}

animate();
//--------------------------------------------------------------------- === ---------------------------------------------------------------------//

