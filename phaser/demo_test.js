var w=800; // Ancho del lienzo del juego
var h=400; // Alto del lienzo del juego
var jugador; // Variable para el jugador
var fondo; // Variable para el fondo
var bala, balaD=false, nave; // Variables para la bala y el estado de la bala
var salto; // Variable para el control de salto
var menu; // Variable para el menú
var velocidadBala; // Variable para la velocidad de la bala
var despBala; // Variable para el desplazamiento de la bala
var estatusAire; // Variable para el estado de aire del jugador
var estatuSuelo; // Variable para el estado del suelo del jugador
var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[]; // Variables para la red neuronal
var modoAuto = false, eCompleto=false; // Variables para el modo automático y entrenamiento completo
var naveSuperior; // Variable para la nueva nave

var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render }); // Creación del juego

function preload() { // Función de precarga de recursos
    juego.load.image('fondo', 'assets/game/fondo.jpg'); // Carga de la imagen de fondo
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48); // Carga de la hoja de sprites del jugador
    juego.load.image('nave', 'assets/game/ufo.png'); // Carga de la imagen de la nave
    juego.load.image('bala', 'assets/sprites/purple_ball.png'); // Carga de la imagen de la bala
    juego.load.image('menu', 'assets/game/menu.png'); // Carga de la imagen del menú
}

function create() { // Función de creación de elementos
    juego.physics.startSystem(Phaser.Physics.ARCADE); // Inicialización del sistema de física
    juego.physics.arcade.gravity.y = 800; // Establecimiento de la gravedad
    juego.time.desiredFps = 30; // Configuración de la velocidad de fotogramas

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo'); // Creación del fondo
    nave = juego.add.sprite(w-100, h-70, 'nave'); // Creación de la nave
    bala = juego.add.sprite(w-100, h, 'bala'); // Creación de la bala
    jugador = juego.add.sprite(50, h, 'mono'); // Creación del jugador

    juego.physics.enable(jugador); // Habilitación de la física para el jugador
    jugador.body.collideWorldBounds = true; // Establecimiento de límites de colisión para el jugador
    var corre = jugador.animations.add('corre',[8,9,10,11]); // Animación de correr para el jugador
    jugador.animations.play('corre', 10, true); // Reproducción de la animación de correr

    juego.physics.enable(bala); // Habilitación de la física para la bala
    bala.body.collideWorldBounds = true; // Establecimiento de límites de colisión para la bala

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' }); // Creación del texto de pausa
    pausaL.inputEnabled = true; // Habilitación de la interacción con el texto de pausa
    pausaL.events.onInputUp.add(pausa, self); // Asociación de la función de pausa al evento de clic
    juego.input.onDown.add(mPausa, self); // Asociación de la función de pausa al evento de clic del mouse

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR); // Asignación de la tecla de espacio para el salto

    nnNetwork =  new synaptic.Architect.Perceptron(2, 6, 6, 2); // Creación de la red neuronal
    nnEntrenamiento = new synaptic.Trainer(nnNetwork); // Creación del entrenador de la red neuronal

    naveSuperior = juego.add.sprite(10, 10, 'nave'); // Creación de la nueva nave
    juego.physics.enable(naveSuperior); // Habilitación de la física para la nueva nave
    naveSuperior.body.collideWorldBounds = true; // Establecimiento de límites de colisión para la nueva nave
    naveSuperior.body.immovable = true; // Hacer que la nueva nave no se mueva al colisionar con otras cosas
    naveSuperior.body.allowGravity = false; // Deshabilitar la gravedad para que la nave no se caiga

}

function enRedNeural(){ // Función para entrenar la red neuronal
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 10000, shuffle: true}); // Entrenamiento de la red neuronal con los datos de entrenamiento
}

function datosDeEntrenamiento(param_entrada){ // Función para obtener los datos de entrenamiento
    console.log("Entrada",param_entrada[0]+" "+param_entrada[1]); // Registro de la entrada
    nnSalida = nnNetwork.activate(param_entrada); // Activación de la red neuronal
    var aire=Math.round( nnSalida[0]*100 ); // Cálculo del porcentaje de aire
    var piso=Math.round( nnSalida[1]*100 ); // Cálculo del porcentaje de suelo
    console.log("Valor ","En el Aire %: "+ aire + " En el suelo %: " + piso ); // Registro de los valores de salida
    return nnSalida[0]>=nnSalida[1]; // Devolución del resultado de la red neuronal
}

function pausa(){ // Función para pausar el juego
    juego.paused = true; // Pausa del juego
    menu = juego.add.sprite(w/2,h/2, 'menu'); // Creación del menú
    menu.anchor.setTo(0.5, 0.5); // Ajuste del punto de anclaje del menú
}

function mPausa(event){ // Función para manejar la pausa
    if(juego.paused){ // Verificación de si el juego está pausado
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2, // Cálculo de límites del menú
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  , // Posición del cursor en x
            mouse_y = event.y  ; // Posición del cursor en y

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){ // Verificación de clic dentro del menú
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){ // Restablecimiento de entrenamiento
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) { // Inicio del modo automático
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" ); // Registro del número de valores de entrenamiento
                    enRedNeural(); // Entrenamiento de la red neuronal
                    eCompleto=true; // Marcado de entrenamiento como completo
                }
                modoAuto = true; // Activación del modo automático
            }

            menu.destroy(); // Eliminación del menú
            resetVariables(); // Restablecimiento de variables
            juego.paused = false; // Despausa del juego
        }
    }
}

function resetVariables(){ // Función para restablecer las variables
    jugador.body.velocity.x=0; // Reinicio de la velocidad en x del jugador
    jugador.body.velocity.y=0; // Reinicio de la velocidad en y del jugador
    bala.body.velocity.x = 0; // Reinicio de la velocidad en x de la bala
    bala.position.x = w-100; // Reinicio de la posición en x de la bala
    jugador.position.x=50; // Reinicio de la posición en x del jugador
    balaD=false; // Reinicio del estado de la bala
}

function saltar(){ // Función para el salto del jugador
    jugador.body.velocity.y = -270; // Establecimiento de la velocidad vertical del jugador para el salto
}

function update() { // Función de actualización del juego
    fondo.tilePosition.x -= 1; // Desplazamiento del fondo

    // Detección de colisión entre la bala y el jugador
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala, naveSuperior, colisionV, null, this); // Detección de colisión entre el jugador y la nueva nave

    estatuSuelo = 1; // Inicialización del estado del suelo
    estatusAire = 0; // Inicialización del estado del aire

    if (!jugador.body.onFloor()) { // Verificación de si el jugador no está en el suelo
        estatuSuelo = 0; // Establecimiento del estado del suelo como falso
        estatusAire = 1; // Establecimiento del estado del aire como verdadero
    }

    despBala = Math.floor(jugador.position.x - bala.position.x); // Cálculo del desplazamiento de la bala

    // Manejo del movimiento del jugador hacia la derecha e izquierda
    if (juego.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
        jugador.body.velocity.x = -150; // Movimiento hacia la izquierda
    } else if (juego.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        jugador.body.velocity.x = 150; // Movimiento hacia la derecha
    } else {
        jugador.body.velocity.x = 0; // Detener el movimiento si no se presiona ninguna tecla de dirección
    }

    // Manejo del salto del jugador
    if (modoAuto == false && salto.isDown && jugador.body.onFloor()) { // Verificación de si el modo automático está desactivado y se presionó la tecla de salto
        saltar(); // Realización del salto
    }

    if (!balaD) { // Verificación de si la bala está disparada
        disparo(); // Disparo de la bala
    }

    if (bala.position.x <= 0) { // Verificación de si la bala ha salido de la pantalla
        resetVariables(); // Restablecimiento de variables
    }

    if (!modoAuto && bala.position.x > 0) { // Verificación de si el modo automático está desactivado y la bala está en movimiento

        datosEntrenamiento.push({ // Agregación de datos de entrenamiento
            'input': [despBala, velocidadBala],
            'output': [estatusAire, estatuSuelo]
        });

        console.log("Desplazamiento Bala, Velocidad Bala, Estatus, Estatus: ",
            despBala + " " + velocidadBala + " " + estatusAire + " " + estatuSuelo); // Registro de datos de entrenamiento
    }
    // Manejo del disparo de la nueva nave
    if (!balaDSuperior) { // Verificación de si la bala de la nueva nave está disparada
        disparoSuperior(); // Disparo de la bala de la nueva nave
    }
}

var balaDSuperior = false; // Variable para el estado de la bala de la nueva nave

function disparoSuperior() { // Función para el disparo de la bala de la nueva nave
    // Ajusta la posición de la bala de la nueva nave para que comience desde la posición de la nave superior
    var x = naveSuperior.x + naveSuperior.width / 2;
    var y = naveSuperior.y;

    // Ajusta la velocidad de la bala de la nueva nave para que vaya hacia abajo
    var velocidadBalaSuperior = 200;

    // Crea la bala de la nueva nave
    var balaSuperior = juego.add.sprite(x, y, 'bala');
    juego.physics.enable(balaSuperior);
    balaSuperior.body.velocity.y = velocidadBalaSuperior;

    balaDSuperior = true; // Marca la bala de la nueva nave como disparada

    // Elimina la bala de la nueva nave después de un tiempo
    juego.time.events.add(Phaser.Timer.SECOND * 2, function() {
        balaSuperior.destroy();
        balaDSuperior = false; // Restablece el estado de la bala de la nueva nave
    }, this);
}

function disparo(){ // Función para el disparo de la bala
    velocidadBala =  -1 * velocidadRandom(300,800); // Cálculo de la velocidad aleatoria de la bala
    bala.body.velocity.y = 0 ; // Establecimiento de la velocidad en y de la bala
    bala.body.velocity.x = velocidadBala ; // Establecimiento de la velocidad en x de la bala
    balaD=true; // Marcado de la bala como disparada
}

function colisionH(){ // Función para la colisión horizontal
    pausa(); // Pausa del juego
}

function colisionV(){ // Función para la colisión vertical
    pausa(); // Pausa del juego
}

function velocidadRandom(min, max) { // Función para generar una velocidad aleatoria
    return Math.floor(Math.random() * (max - min + 1)) + min; // Cálculo de la velocidad aleatoria
}

function render(){ // Función de renderizado
    // No se realiza ninguna acción de renderizado en esta función
}
