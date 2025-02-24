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
//--------------------------------------------------------------------- =Configurações Estrutura/Objeto= ---------------------------------------------------------------------//
//--------------------------------------------------------------------- =Sala (Método otimizado com quadros e molduras)= ----------------------------------------------------------//

if (!scene) {
    console.error("🚫 Erro: A cena (scene) deve ser criada antes de carregar texturas.");
} else {
    // Carregar texturas para as paredes, chão, quadros e molduras
    const textureLoader = new THREE.TextureLoader();

    const texturePaths = [
        { path: 'textures/wall_texture.jpg', repeat: { x: 1, y: 1 } },
        { path: 'textures/floor_texture.jpg', repeat: { x: 4, y: 8 } },
        { path: 'textures/wood_frame.jpg' },
        { path: 'textures/gold_frame.jpg' },
        { path: 'textures/colossus.jpg' },
        { path: 'textures/matrix.jpg' },
        { path: 'textures/colossus2.jpg' },
        { path: 'textures/artwork1.jpg' },
        { path: 'textures/artwork2.jpg' },
        { path: 'textures/artwork3.jpg' },
        { path: 'textures/artwork4.jpg' }
    ];

    let loadedTextures = 0;

    function loadTexture(texturePath, repeatX = 1, repeatY = 1) {
        const texture = textureLoader.load(
            texturePath,
            () => {
                loadedTextures++;
                console.log(`✅ Textura carregada: ${texturePath} (${loadedTextures}/${texturePaths.length})`);
                if (loadedTextures === texturePaths.length) console.log("🎉 Todas as texturas foram carregadas!");
            },
            undefined,
            (err) => console.error(`🚫 Erro ao carregar textura: ${texturePath}`, err)
        );

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        texture.flipY = false;
        return texture;
    }

    const wallTexture = loadTexture(texturePaths[0].path, texturePaths[0].repeat.x, texturePaths[0].repeat.y);
    const floorTexture = loadTexture(texturePaths[1].path, texturePaths[1].repeat.x, texturePaths[1].repeat.y);
    const woodFrameTexture = loadTexture('textures/wood_frame.jpg');
    const goldFrameTexture = loadTexture('textures/gold_frame.jpg');

    const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture, side: THREE.DoubleSide, roughness: 0.5 });
    const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture, side: THREE.DoubleSide, roughness: 0.4 });
    const baseboardMaterial = new THREE.MeshStandardMaterial({ color: 0x2e2e2e, side: THREE.DoubleSide }); // Rodapé marrom

    function createWall(width, height, material, position, rotation) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(position.x, position.y, position.z);
        wall.rotation.set(rotation.x, rotation.y, rotation.z);
        wall.receiveShadow = true;
        scene.add(wall);
    }

    function createFloor(width, depth, material, position) {
        const geometry = new THREE.PlaneGeometry(width, depth);
        const floor = new THREE.Mesh(geometry, material);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(position.x, position.y, position.z);
        floor.receiveShadow = true;
        scene.add(floor);
    }

    // Função para criar rodapé ao longo das paredes
    function createBaseboard(length, height, material, position, rotation) {
        const geometry = new THREE. BoxGeometry(length, height);
        const baseboard = new THREE.Mesh(geometry, material);
        baseboard.position.set(position.x, position.y, position.z);
        baseboard.rotation.set(rotation.x, rotation.y, rotation.z);
        baseboard.receiveShadow = true;
        baseboard.castShadow = true;
        scene.add(baseboard);
    }

    // Função para criar quadros com moldura personalizada
    function createFramedPicture(width, height, imageTexture, position, rotation, frameConfig = {}) {
        const {
            thickness = 0.2,            // Espessura da moldura
            color = 0x2e2e2e,           // Cor padrão
            texture = null,            // Textura opcional da moldura
            frameOffset = -0.01        // Posição da moldura em relação à imagem (valor negativo para trás, positivo para frente)
        } = frameConfig;

        const frameMaterial = texture
            ? new THREE.MeshStandardMaterial({ map: texture })
            : new THREE.MeshStandardMaterial({ color });

        // Criar e posicionar a moldura com offset configurável
        const frameGeometry = new THREE.PlaneGeometry(width + thickness, height + thickness);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(
            position.x + frameOffset * Math.sin(rotation.y),
            position.y,
            position.z - frameOffset * Math.cos(rotation.y)
        );
        frame.rotation.set(rotation.x, rotation.y, rotation.z);
        frame.receiveShadow = true;
        frame.castShadow = true;
        scene.add(frame);

        // Criar e posicionar a imagem levemente à frente da moldura para evitar sobreposição visual
        const pictureGeometry = new THREE.PlaneGeometry(width, height);
        const pictureMaterial = new THREE.MeshStandardMaterial({ map: imageTexture, side: THREE.DoubleSide });
        const picture = new THREE.Mesh(pictureGeometry, pictureMaterial);

        const imageOffset = 0.01; // Ajuste padrão da imagem em relação à moldura
        picture.position.set(
            position.x + imageOffset * Math.sin(rotation.y),
            position.y,
            position.z - imageOffset * Math.cos(rotation.y)
        );

        picture.rotation.set(rotation.x + Math.PI, rotation.y, rotation.z); // Inverte a orientação vertical da imagem
        picture.receiveShadow = true;
        picture.castShadow = true;
        scene.add(picture);
    }

    // Texturas das obras
    const picturesTextures = [
        loadTexture('textures/abapuru.jpg'),
        loadTexture('textures/cabelosolto.jpg'),
        loadTexture('textures/chad.jpg'),
        loadTexture('textures/dedonodedo.jpg'),
        loadTexture('textures/monalizabuhgada.jpg'),
        loadTexture('textures/galego.jpg'),
        loadTexture('textures/santaseia.jpg'),
        loadTexture('textures/seila.jpg'),
        loadTexture('textures/obra1.jpg')
    ];

    // Função para posicionar quadros com molduras personalizadas
    function placeIndividualPictures(picturesArray, wallPosition, wallRotation, positions, framesConfig) {
        const pictureWidth = 3;
        const pictureHeight = 2;

        for (let i = 0; i < picturesArray.length; i++) {
            const pos = positions[i];
            const frameConfig = framesConfig[i] || {};
            createFramedPicture(
                pictureWidth,
                pictureHeight,
                picturesArray[i],
                { x: wallPosition.x + pos.x, y: wallPosition.y + pos.y, z: wallPosition.z + pos.z },
                wallRotation,
                frameConfig
            );
        }
    }

    // Posições das obras nas paredes
    const positionsForBackWall = [
        { x: -6, y: 2.5, z: 0 },
        { x: 0, y: 2.5, z: 0 },
        { x: 6, y: 2.5, z: 0 }
    ];

    const positionsForLeftWall = [
        { x: 0, y: 2.5, z: -6 },
        { x: 0, y: 2.5, z: 0 },
        { x: 0, y: 2.5, z: 6 }
    ];

    const positionsForRightWall = [
        { x: 0, y: 2.5, z: -6 },
        { x: 0, y: 2.5, z: 0 },
        { x: 0, y: 2.5, z: 6 }
    ];

    // Configurações individuais das molduras para cada quadro ("frameOffset" ajusta a profundidade da moldura)
    const backWallFramesConfig = [
        { thickness: 0.3, color: 0x8b4513, texture: woodFrameTexture, frameOffset: 0.1 }, // Moldura levemente atrás da imagem
        { thickness: 0.15, color: 0xffd700, texture: goldFrameTexture, frameOffset: 0.1 },
        { thickness: 0.25, color: 0x000000, frameOffset: 0.1 }
    ];

    const leftWallFramesConfig = [
        { thickness: 0.2, color: 0xffffff, frameOffset: -0.015 },
        { thickness: 0.2, color: 0x8b0000, texture: woodFrameTexture, frameOffset: -0.02 },
        { thickness: 0.3, color: 0x2e2e2e, frameOffset: -0.01 }
    ];

    const rightWallFramesConfig = [
        { thickness: 0.1, color: 0x4682b4, frameOffset: -0.02 },
        { thickness: 0.2, color: 0xd2691e, frameOffset: -0.015 },
        { thickness: 0.25, color: 0xdaa520, texture: goldFrameTexture, frameOffset: -0.025 }
    ];

    // Criar chão e paredes
    createFloor(25, 25, floorMaterial, { x: 0, y: -0.1, z: 0 });
    createWall(25, 10, wallMaterial, { x: 0, y: 5, z: -12.5 }, { x: 0, y: 0, z: 0 });
    createWall(25, 10, wallMaterial, { x: -12.5, y: 5, z: 0 }, { x: 0, y: Math.PI / 2, z: 0 });
    createWall(25, 10, wallMaterial, { x: 12.5, y: 5, z: 0 }, { x: 0, y: -Math.PI / 2, z: 0 });

    // Distribuição dos quadros com molduras personalizadas
    placeIndividualPictures(picturesTextures.slice(0, 3), { x: 0, y: 0, z: -12.3 }, { x: 0, y: 0, z: 0 }, positionsForBackWall, backWallFramesConfig);
    placeIndividualPictures(picturesTextures.slice(3, 6), { x: -12.4, y: 0, z: 0 }, { x: 0, y: Math.PI / 2, z: 0 }, positionsForLeftWall, leftWallFramesConfig);
    placeIndividualPictures(picturesTextures.slice(6, 9), { x: 12.4, y: 0, z: 0 }, { x: 0, y: -Math.PI / 2, z: 0 }, positionsForRightWall, rightWallFramesConfig);

    // Criar rodapé com cor marrom em todas as paredes
    const baseboardHeight = 0.2;
    createBaseboard(25, baseboardHeight, baseboardMaterial, { x: 0, y: -0.1, z: -12.49 }, { x: 0, y: 0, z: 0 });
    createBaseboard(25, baseboardHeight, baseboardMaterial, { x: -12.49, y: -0.1, z: 0 }, { x: 0, y: Math.PI / 2, z: 0 });
    createBaseboard(25, baseboardHeight, baseboardMaterial, { x: 12.49, y: -0.1, z: 0 }, { x: 0, y: -Math.PI / 2, z: 0 });

    // Resumo no console após carregamento
    setTimeout(() => {
        console.log(`📊 Texturas carregadas: ${loadedTextures}/${texturePaths.length}`);
    }, 1500);
}

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

