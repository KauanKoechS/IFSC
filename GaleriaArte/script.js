//--------------------------------------------------------------------- =Configuração inicial do Three.js= ---------------------------------------------------------------------//
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("canvas3D") });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    let lampButton;
    let bulbLight;
//--------------------------------------------------------------------- =Configurações da Iluminação= ---------------------------------------------------------------------//
    // Melhorando a iluminação para gerar sombras reais
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Luz ambiente
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true; // IMPORTANTE: Ativa sombras na luz

    // Ajusta a resolução da sombra para melhorar a qualidade
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);

//--------------------------------------------------------------------- =Configurações Estrutura/Objeto= ---------------------------------------------------------------------//
//--------------------------------------------------------------------- =Sala=
//--------------------------------------------------------------------- =Configurações Estrutura/Objeto= ---------------------------------------------------------------------//
//--------------------------------------------------------------------- =Sala=
// Função para criar paredes
function createWall(width, height, depth, color, position) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(position.x, position.y, position.z);
    wall.castShadow = true; // Permite que as paredes projetem sombras
    wall.receiveShadow = true; // Permite que recebam sombras de outros objetos
    scene.add(wall);
}

// Criar paredes
    createWall(25, 0.2, 25, 0x808080, { x: 0, y: -0.1, z: 0 }); // Chão menor

    createWall(25, 10, 0.2, 0xffffff, { x: 0, y: 5, z: -12.5 }); // Parede de fundo
    createWall(0.2, 10, 25, 0xffffff, { x: -12.5, y: 5, z: 0 }); // Parede esquerda
    createWall(0.2, 10, 25, 0xffffff, { x: 12.5, y: 5, z: 0 });  // Parede direita

// Chão recebendo sombra
    const groundGeometry = new THREE.PlaneGeometry(23, 23); // Aumentei levemente para cobrir possíveis espaços
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);

    ground.rotation.x = -Math.PI / 2; // Deixar plano
    ground.position.y = 0.01; // Ajustado um pouco mais para cobrir vãos
    ground.receiveShadow = true; // Permite receber sombras

    scene.add(ground);

//--------------------------------------------------------------------- =Céu=
// Criando a esfera do céu
    const skyGeometry = new THREE.SphereGeometry(200, 64, 64);
    const skyMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('textures/sky.jpg'),
        side: THREE.BackSide // Renderiza dentro da esfera
    });
    const skySphere = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skySphere);
//--------------------------------------------------------------------- =Abajur=
    function createDeskLamp(position, rotation) {
        const lampGroup = new THREE.Group(); // Grupo para mover tudo junto

        // Base do abajur
        const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(2, 0, 2.6);
        lampGroup.add(base);

        // Criando o botão na base do abajur
        lampButton = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0xff0000, side: THREE.DoubleSide })
        );
        lampButton.position.set(2.5, 0.3, 2.6);
        lampButton.name = "lampButton";
        lampButton.castShadow = true;
        lampButton.receiveShadow = true;
        lampGroup.add(lampButton);


        // Primeiro braço do abajur
        const arm1Geometry = new THREE.CylinderGeometry(0.3, 0.3, 5, 16);
        const arm1 = new THREE.Mesh(arm1Geometry, baseMaterial);
        arm1.position.set(2, 2.5, 5);
        arm1.rotation.x = Math.PI / 6; // Inclinação do braço
        lampGroup.add(arm1);

        // Segundo braço do abajur
        const arm2Geometry = new THREE.CylinderGeometry(0.3, 0.3, 4, 16);
        const arm2 = new THREE.Mesh(arm2Geometry, baseMaterial);
        arm2.position.set(2, 5, 5);
        arm2.rotation.x = -Math.PI / 4; // Outra inclinação
        lampGroup.add(arm2);

        // Cúpula do abajur no formato correto (menor e mais fechada)
        const headGeometry = new THREE.CylinderGeometry(1.2, 2.2, 2.5, 32, 1, true); // Agora é menor e mais fechada
        const headMaterial = new THREE.MeshStandardMaterial({color: 0x222222, metalness: 0.7,  roughness: 0.2, side: THREE.DoubleSide });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(2, 6, 2); // Ajustado para um encaixe melhor
        head.rotation.x = Math.PI / 5; // Pequena inclinação para baixo
        lampGroup.add(head);
        // Criando a lâmpada dentro da cúpula
        const bulbGeometry = new THREE.SphereGeometry(0.8, 25, 25); // Lâmpada menor
        const bulbMaterial = new THREE.MeshStandardMaterial({ color: 0xffffcc,  emissive: 0xffffaa,  emissiveIntensity: 2 });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.set(2, 6.7, 2.6); // Agora mais centralizada dentro da cúpula
        lampGroup.add(bulb);

        // Criando a luz focada do abajur (agora alinhada corretamente)
        bulbLight = new THREE.SpotLight(0xfff1c4, 10, 20, Math.PI / 7, 0.9, 2); // Ângulo ajustado
        bulbLight.position.set(2, 5.8, 2.6); // Dentro da cúpula

        // Ajustando o alvo da luz para seguir a inclinação da cúpula
        const lightTarget = new THREE.Object3D();
        const angle = -Math.PI / 6; // O mesmo ângulo da inclinação da cúpula

        lightTarget.position.set(
            2 - Math.sin(angle) * 0.1, // Ajusta a direção da luz no eixo X
            2.5, // Mantém a altura correta
            2.6 - Math.cos(angle) * 7 // Ajusta a direção da luz no eixo Z
        );
        scene.add(lightTarget);
        bulbLight.target = lightTarget;

        bulbLight.castShadow = true;

        // Adicionando ao grupo do abajur
        lampGroup.add(bulbLight);
        lampGroup.add(lightTarget);
        
        // Ajustando posição final
        lampGroup.position.set(position.x, position.y, position.z);
        lampGroup.rotation.y = rotation; // Rotaciona para a direção desejada

    
        scene.add(lampGroup);
    }
// Criar um abajur articulado em um canto da sala
    createDeskLamp({ x: -6, y: 0, z: 7}, Math.PI / 6);
//--------------------------------------------------------------------- =Botão Abajur=
// Criando um Raycaster para detectar cliques
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

// Estado inicial do botão e da lâmpada
    let isLampOn = true;
    let isButtonPressed = false; // Estado do botão

// Função para ligar/desligar a lâmpada e mover o botão
    function toggleLamp() {
        isLampOn = !isLampOn;
        bulbLight.visible = isLampOn;

        // Alternar entre pressionado e solto ajustando a posição do botão
        if (lampButton) {
            isButtonPressed = !isButtonPressed;
            lampButton.position.y = isButtonPressed ? 0.18 : 0.3; // Movendo o botão fisicamente
        }
    }

// Função para detectar cliques no botão do abajur
    function onDocumentMouseDown(event) {
        event.preventDefault();

        // Converte a posição do clique para coordenadas normalizadas (-1 a 1)
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Faz o Raycaster detectar objetos na cena
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.name === "lampButton") {
                toggleLamp(); // Liga/desliga a lâmpada
                break;
            }
        }
    }

// Adicionando evento de clique no botão do abajur
    window.addEventListener("mousedown", onDocumentMouseDown);

// Evento para detectar a tecla "L" e desligar/ligar a lâmpada
    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "l") {
            toggleLamp();
        }
    });

//--------------------------------------------------------------------- =Espada Rúnica=
    const fbxLoader = new THREE.FBXLoader();
    const textureLoader = new THREE.TextureLoader();

    fbxLoader.load('models/SwordLow_UV.fbx', function (object) {
        
        // Carregar as texturas
        const baseColor = textureLoader.load('textures/SwordLow_UV_DefaultMaterial_BaseColor.tga.png');
        const metallic = textureLoader.load('textures/SwordLow_UV_DefaultMaterial_Metallic.tga.png');
        const normalMap = textureLoader.load('textures/SwordLow_UV_DefaultMaterial_Normal.tga.png');
        const roughness = textureLoader.load('textures/SwordLow_UV_DefaultMaterial_Roughness.tga.png');

        // Corrigir a orientação da textura se estiver invertida
        baseColor.flipY = false;
        metallic.flipY = false;
        normalMap.flipY = false;
        roughness.flipY = false;

        // Criar um material PBR para a espada
        const swordMaterial = new THREE.MeshStandardMaterial({
            map: baseColor, // Cor base
            metalnessMap: metallic, // Mapa metálico
            normalMap: normalMap, // Mapa normal
            roughnessMap: roughness, // Mapa de rugosidade
            side: THREE.DoubleSide // Garante renderização dos dois lados
        });

        // Aplicar o material a todos os meshes do modelo
        object.traverse((child) => {
            if (child.isMesh) {
                child.material = swordMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Ajustar tamanho e posição da espada
        object.scale.set(0.6, 0.6, 0.6); // Ajuste fino do tamanho
        object.position.set(-7, 0.3, 1); // Posição na frente do abajur
        swordObject = object; // Guarda referência da espada

        // Adicionar o modelo à cena
        scene.add(object);
    }, 
    // Função de erro caso o arquivo não seja encontrado
    undefined, function (error) {
        console.error("Erro ao carregar o modelo FBX:", error);
    });
//--------------------- =Espada Rúnica Interação=
    let swordObject = null; // Armazena a espada
    let initialY = 1; // Altura inicial da espada
    const minDistance = 10; // Distância mínima para ativar o scroll
    const minHeight = 0.3; // Altura mínima da espada
    const maxHeight = 5; // Altura máxima da espada

// Evento de Scroll para mover a espada no eixo Y
    window.addEventListener("wheel", (event) => {
        if (swordObject) {
            // Calcula a distância entre a câmera e a espada
            let distance = camera.position.distanceTo(swordObject.position);

            // Se a câmera estiver perto o suficiente, permitir o controle do scroll
            if (distance < minDistance) {
                let newY = swordObject.position.y - event.deltaY * 0.005; // Ajusta a altura com base no scroll
                newY = Math.max(minHeight, Math.min(maxHeight, newY)); // Limita o movimento entre minHeight e maxHeight
                swordObject.position.y = newY;
            }
        }
    });

    // Evento de soltar o clique para "largar" a espada
    window.addEventListener("mouseup", () => {
        isDragging = false;
    });
//--------------------- =Espada Rúnica Particulas de sangue=
//--------------------------------------------------------------------- =Quadros=
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

//--------------------------------------------------------------------- =Particulas= ---------------------------------------------------------------------//
//--------------------- =Partículas de Sangue Melhoradas= ---------------------
const bloodParticlesGeometry = new THREE.BufferGeometry();
const bloodParticlesCount = 300; // Mais partículas para parecer denso
const bloodPositions = new Float32Array(bloodParticlesCount * 3);

// Gerar partículas em torno da espada, algumas perto da lâmina
for (let i = 0; i < bloodParticlesCount * 3; i += 3) {
    bloodPositions[i] = (Math.random() - 0.5) * 0.5; // Menos espaçamento lateral
    bloodPositions[i + 1] = (Math.random()) * 2.5; // Algumas subindo e outras descendo
    bloodPositions[i + 2] = (Math.random() - 0.5) * 0.5;  // Pequeno espalhamento frontal/traseiro
}

bloodParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(bloodPositions, 3));

// Criando material das partículas com mais variação
const bloodTexture = new THREE.TextureLoader().load("textures/blood.png");
const bloodParticlesMaterial = new THREE.PointsMaterial({
    color: 0x990000, // Vermelho mais escuro (mais realista)
    size: 0.05, // Reduzir tamanho das gotas
    depthWrite: false,
    blending: THREE.AdditiveBlending, // Faz as partículas brilharem um pouco
    transparent: true,
    opacity: 0.9,
    map: bloodTexture,
});

// Criando o sistema de partículas
const bloodParticles = new THREE.Points(bloodParticlesGeometry, bloodParticlesMaterial);
scene.add(bloodParticles);

//--------------------- =Animação do Sangue Escorrendo= ---------------------
function animateBloodParticles() {
    requestAnimationFrame(animateBloodParticles);

    const positions = bloodParticlesGeometry.attributes.position.array;
    for (let i = 0; i < bloodParticlesCount * 3; i += 3) {
        positions[i + 1] -= 0.002; // Simula sangue escorrendo para baixo
        if (positions[i + 1] < -1) { // Se sair muito da espada, reaparece no topo
            positions[i + 1] = 2.5;
        }
    }
    bloodParticlesGeometry.attributes.position.needsUpdate = true;

    if (swordObject) {
        bloodParticles.position.copy(swordObject.position); // Faz as partículas seguirem a espada
    }
}

animateBloodParticles();

//--------------------------------------------------------------------- =Iniciar Funções= ---------------------------------------------------------------------//
// Função de animação
    function animate() {
        requestAnimationFrame(animate);
        updateCameraMovement();  // Atualiza posição da câmera
        renderer.render(scene, camera);
    }

    animate();
//--------------------------------------------------------------------- === ---------------------------------------------------------------------//

